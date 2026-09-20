package com.smartopd.service;

import com.smartopd.dto.StaffActionResponse;
import com.smartopd.dto.TokenResponse;
import com.smartopd.model.*;
import com.smartopd.repository.DoctorRepository;
import com.smartopd.repository.OpdSessionRepository;
import com.smartopd.repository.TokenRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class QueueService {

    private static final Logger log = LoggerFactory.getLogger(QueueService.class);

    private final TokenRepository tokenRepository;
    private final DoctorRepository doctorRepository;
    private final OpdSessionRepository opdSessionRepository;
    private final QueueEngine queueEngine;
    private final SmsService smsService;

    public QueueService(TokenRepository tokenRepository,
                        DoctorRepository doctorRepository,
                        OpdSessionRepository opdSessionRepository,
                        QueueEngine queueEngine,
                        SmsService smsService) {
        this.tokenRepository = tokenRepository;
        this.doctorRepository = doctorRepository;
        this.opdSessionRepository = opdSessionRepository;
        this.queueEngine = queueEngine;
        this.smsService = smsService;
    }

    /**
     * Resolves an OpdSession given optional doctorId, sessionId, or department.
     */
    public OpdSession resolveSession(Long doctorId, Long sessionId, String department) {
        if (sessionId != null) {
            return opdSessionRepository.findById(sessionId)
                    .orElseThrow(() -> new IllegalArgumentException("OPD Session not found with ID: " + sessionId));
        }

        if (doctorId != null) {
            return opdSessionRepository.findFirstByDoctorIdAndSessionStatusNotOrderByIdDesc(doctorId, SessionStatus.CLOSED)
                    .orElseGet(() -> {
                        Doctor doc = doctorRepository.findById(doctorId)
                                .orElseThrow(() -> new IllegalArgumentException("Doctor not found with ID: " + doctorId));
                        OpdSession newSession = new OpdSession(doc);
                        return opdSessionRepository.save(newSession);
                    });
        }

        if (department != null && !department.isBlank()) {
            Optional<OpdSession> sessionOpt = opdSessionRepository
                    .findFirstByDoctorDepartmentIgnoreCaseAndSessionStatusNotOrderByIdDesc(department.trim(), SessionStatus.CLOSED);
            if (sessionOpt.isPresent()) {
                return sessionOpt.get();
            }
            Doctor doc = doctorRepository.findFirstByDepartmentIgnoreCaseAndActiveTrue(department.trim())
                    .orElseThrow(() -> new IllegalArgumentException("No active doctor found for department: " + department));
            OpdSession newSession = new OpdSession(doc);
            return opdSessionRepository.save(newSession);
        }

        // Fallback: first available non-closed session or create for first active doctor
        List<OpdSession> activeSessions = opdSessionRepository.findBySessionStatus(SessionStatus.ACTIVE);
        if (!activeSessions.isEmpty()) {
            return activeSessions.get(0);
        }

        List<Doctor> doctors = doctorRepository.findByActiveTrue();
        if (!doctors.isEmpty()) {
            OpdSession session = new OpdSession(doctors.get(0));
            return opdSessionRepository.save(session);
        }

        throw new IllegalStateException("No active doctors or OPD sessions found");
    }

    /**
     * Creates and books a new Token.
     */
    @Transactional
    public Token bookToken(String phone, String department, Long doctorId) {
        OpdSession session = resolveSession(doctorId, null, department);
        Doctor doctor = session.getDoctor();

        // Calculate queue position & patients ahead
        long waitingCount = tokenRepository.countBySessionIdAndStatus(session.getId(), TokenStatus.WAITING);
        long totalTokensForSession = tokenRepository.countBySessionId(session.getId());

        String prefix = doctor.getDepartment().substring(0, Math.min(4, doctor.getDepartment().length())).toUpperCase();
        String tokenNumber = String.format("%s-%03d", prefix, totalTokensForSession + 1);

        Token token = new Token(tokenNumber, phone, doctor.getDepartment(), doctor, session);
        int patientsAhead = (int) waitingCount;
        token.setPatientsAhead(patientsAhead);
        token.setQueuePosition(patientsAhead + 1);

        // QueueEngine estimation
        LocalDateTime now = LocalDateTime.now();
        int estimatedWaitMinutes = queueEngine.calculateEstimatedWaitMinutes(
                patientsAhead,
                doctor.getAvgConsultMinutes(),
                session.getCurrentDelayMinutes(),
                session.getEmergencyAdjustmentMinutes()
        );
        LocalDateTime estTime = now.plusMinutes(estimatedWaitMinutes);
        QueueEngine.ArrivalWindow window = queueEngine.calculateArrivalWindow(estTime);

        token.setEstimatedWaitMinutes(estimatedWaitMinutes);
        token.setEstimatedConsultationTime(estTime);
        token.setArrivalWindowStart(window.start());
        token.setArrivalWindowEnd(window.end());
        token.setArrivalWindowFormatted(window.formatted());

        Token saved = tokenRepository.save(token);

        // Send booking confirmation SMS and log
        smsService.sendTokenBookedSms(saved);

        return saved;
    }

    /**
     * Retrieves token by ID with fresh wait calculation.
     */
    @Transactional(readOnly = true)
    public Token getToken(Long id) {
        Token token = tokenRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Token not found with ID: " + id));
        return token;
    }

    /**
     * Recalculates all WAITING tokens for a session and logs SMS updates.
     */
    @Transactional
    public List<Token> recalculateWaitingTokens(OpdSession session, String reason) {
        List<Token> waitingTokens = tokenRepository
                .findBySessionIdAndStatusOrderByQueuePositionAscIdAsc(session.getId(), TokenStatus.WAITING);

        LocalDateTime now = LocalDateTime.now();
        int avgConsult = session.getDoctor().getAvgConsultMinutes();
        int delay = session.getCurrentDelayMinutes();
        int emergency = session.getEmergencyAdjustmentMinutes();

        for (int i = 0; i < waitingTokens.size(); i++) {
            Token token = waitingTokens.get(i);
            int patientsAhead = i;
            int queuePosition = i + 1;

            int waitMinutes = queueEngine.calculateEstimatedWaitMinutes(patientsAhead, avgConsult, delay, emergency);
            LocalDateTime estTime = queueEngine.calculateEstimatedTime(now, patientsAhead, avgConsult, delay, emergency);
            QueueEngine.ArrivalWindow window = queueEngine.calculateArrivalWindow(estTime);

            token.setPatientsAhead(patientsAhead);
            token.setQueuePosition(queuePosition);
            token.setEstimatedWaitMinutes(waitMinutes);
            token.setEstimatedConsultationTime(estTime);
            token.setArrivalWindowStart(window.start());
            token.setArrivalWindowEnd(window.end());
            token.setArrivalWindowFormatted(window.formatted());

            tokenRepository.save(token);

            // Log update SMS to sms_log
            smsService.sendQueueRecalculatedSms(token, reason);
        }

        return waitingTokens;
    }

    /**
     * Staff action: Call next patient.
     * Completes previous active consultation, moves next waiting to IN_CONSULTATION,
     * recalculates remaining waiting tokens.
     */
    @Transactional
    public StaffActionResponse callNext(Long doctorId, Long sessionId) {
        OpdSession session = resolveSession(doctorId, sessionId, null);

        // 1. Complete previous consultation if any
        Optional<Token> currentConsultationOpt = tokenRepository
                .findFirstBySessionIdAndStatus(session.getId(), TokenStatus.IN_CONSULTATION);
        currentConsultationOpt.ifPresent(curr -> {
            curr.setStatus(TokenStatus.COMPLETED);
            tokenRepository.save(curr);
            log.info("Completed consultation for token: {}", curr.getTokenNumber());
        });

        // 2. Pick next waiting token
        Optional<Token> nextTokenOpt = tokenRepository
                .findFirstBySessionIdAndStatusOrderByQueuePositionAsc(session.getId(), TokenStatus.WAITING);

        Token calledToken = null;
        if (nextTokenOpt.isPresent()) {
            calledToken = nextTokenOpt.get();
            calledToken.setStatus(TokenStatus.IN_CONSULTATION);
            calledToken.setPatientsAhead(0);
            calledToken.setQueuePosition(0);
            calledToken.setEstimatedWaitMinutes(0);
            calledToken = tokenRepository.save(calledToken);

            smsService.sendCallNextSms(calledToken);
            log.info("Called next patient: {}", calledToken.getTokenNumber());
        }

        // 3. Recalculate remaining waiting tokens
        List<Token> remaining = recalculateWaitingTokens(session, "Next Patient Called");

        String msg = calledToken != null
                ? "Called token " + calledToken.getTokenNumber() + " for consultation."
                : "No more waiting patients in queue.";

        return StaffActionResponse.success(
                "CALL_NEXT",
                msg,
                remaining.size(),
                session.getId(),
                session.getSessionStatus(),
                session.getCurrentDelayMinutes(),
                session.getEmergencyAdjustmentMinutes(),
                calledToken != null ? TokenResponse.fromEntity(calledToken) : null
        );
    }

    /**
     * Staff action: Pause / resume session.
     */
    @Transactional
    public StaffActionResponse togglePause(Long doctorId, Long sessionId) {
        OpdSession session = resolveSession(doctorId, sessionId, null);
        boolean newPausedState = !session.isPaused();
        session.setPaused(newPausedState);
        opdSessionRepository.save(session);

        String reason = newPausedState ? "Doctor OPD Session Paused" : "Doctor OPD Session Resumed";
        List<Token> waiting = recalculateWaitingTokens(session, reason);

        return StaffActionResponse.success(
                newPausedState ? "PAUSE" : "RESUME",
                "Session is now " + (newPausedState ? "PAUSED" : "ACTIVE"),
                waiting.size(),
                session.getId(),
                session.getSessionStatus(),
                session.getCurrentDelayMinutes(),
                session.getEmergencyAdjustmentMinutes(),
                null
        );
    }

    /**
     * Staff action: Add doctor delay in minutes.
     */
    @Transactional
    public StaffActionResponse addDoctorDelay(Long doctorId, Long sessionId, int minutes) {
        OpdSession session = resolveSession(doctorId, sessionId, null);
        int newDelay = session.getCurrentDelayMinutes() + minutes;
        session.setCurrentDelayMinutes(Math.max(0, newDelay));
        opdSessionRepository.save(session);

        String reason = "Doctor delay adjustment: " + (minutes >= 0 ? "+" : "") + minutes + " min";
        List<Token> waiting = recalculateWaitingTokens(session, reason);

        return StaffActionResponse.success(
                "DOCTOR_DELAY",
                "Doctor delay updated to " + session.getCurrentDelayMinutes() + " minutes. Recalculated " + waiting.size() + " tokens.",
                waiting.size(),
                session.getId(),
                session.getSessionStatus(),
                session.getCurrentDelayMinutes(),
                session.getEmergencyAdjustmentMinutes(),
                null
        );
    }

    /**
     * Staff action: Add emergency adjustment in minutes.
     */
    @Transactional
    public StaffActionResponse addEmergencyAdjustment(Long doctorId, Long sessionId, int minutes) {
        OpdSession session = resolveSession(doctorId, sessionId, null);
        int newEmergency = session.getEmergencyAdjustmentMinutes() + minutes;
        session.setEmergencyAdjustmentMinutes(Math.max(0, newEmergency));
        opdSessionRepository.save(session);

        String reason = "Emergency hold adjustment: " + (minutes >= 0 ? "+" : "") + minutes + " min";
        List<Token> waiting = recalculateWaitingTokens(session, reason);

        return StaffActionResponse.success(
                "EMERGENCY_ADJUSTMENT",
                "Emergency adjustment updated to " + session.getEmergencyAdjustmentMinutes() + " minutes. Recalculated " + waiting.size() + " tokens.",
                waiting.size(),
                session.getId(),
                session.getSessionStatus(),
                session.getCurrentDelayMinutes(),
                session.getEmergencyAdjustmentMinutes(),
                null
        );
    }

    /**
     * Staff action: Requeue a token.
     */
    @Transactional
    public StaffActionResponse requeueToken(Long tokenId) {
        Token token = tokenRepository.findById(tokenId)
                .orElseThrow(() -> new IllegalArgumentException("Token not found with ID: " + tokenId));

        OpdSession session = token.getSession();

        // Get count of waiting tokens to put this at the end
        long waitingCount = tokenRepository.countBySessionIdAndStatus(session.getId(), TokenStatus.WAITING);
        token.setStatus(TokenStatus.WAITING);
        token.setQueuePosition((int) waitingCount + 1);
        tokenRepository.save(token);

        // Recalculate all tokens
        List<Token> waiting = recalculateWaitingTokens(session, "Token " + token.getTokenNumber() + " Requeued");

        // Fresh instance for response
        Token refreshed = tokenRepository.findById(tokenId).orElse(token);
        smsService.sendRequeuedSms(refreshed);

        return StaffActionResponse.success(
                "REQUEUE",
                "Token " + token.getTokenNumber() + " requeued successfully. Queue position: #" + refreshed.getQueuePosition(),
                waiting.size(),
                session.getId(),
                session.getSessionStatus(),
                session.getCurrentDelayMinutes(),
                session.getEmergencyAdjustmentMinutes(),
                TokenResponse.fromEntity(refreshed)
        );
    }

    @Transactional(readOnly = true)
    public List<Token> getAllTokens() {
        return tokenRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional(readOnly = true)
    public List<Token> getTokensByDepartment(String department) {
        return tokenRepository.findByDepartmentIgnoreCaseOrderByQueuePositionAsc(department);
    }

    @Transactional(readOnly = true)
    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }
}
