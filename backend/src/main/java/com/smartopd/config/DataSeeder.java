package com.smartopd.config;

import com.smartopd.model.*;
import com.smartopd.repository.DoctorRepository;
import com.smartopd.repository.OpdSessionRepository;
import com.smartopd.repository.TokenRepository;
import com.smartopd.service.QueueEngine;
import com.smartopd.service.SmsService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final DoctorRepository doctorRepository;
    private final OpdSessionRepository opdSessionRepository;
    private final TokenRepository tokenRepository;
    private final QueueEngine queueEngine;
    private final SmsService smsService;

    public DataSeeder(DoctorRepository doctorRepository,
                      OpdSessionRepository opdSessionRepository,
                      TokenRepository tokenRepository,
                      QueueEngine queueEngine,
                      SmsService smsService) {
        this.doctorRepository = doctorRepository;
        this.opdSessionRepository = opdSessionRepository;
        this.tokenRepository = tokenRepository;
        this.queueEngine = queueEngine;
        this.smsService = smsService;
    }

    @Override
    public void run(String... args) {
        if (tokenRepository.count() > 0) {
            log.info("Database already seeded. Skipping initial seeding.");
            return;
        }

        log.info("Starting initial demo data seeding: 4 Doctors, 4 OPD Sessions, 20 Demo Tokens...");

        // 1. Seed Doctors
        Doctor drCardio = new Doctor("Priya Nair", "Cardiology", "Room 203", 15);
        Doctor drGen = new Doctor("Rajesh Sharma", "General Medicine", "Room 101", 10);
        Doctor drPedia = new Doctor("Ananya Sen", "Pediatrics", "Room 105", 12);
        Doctor drOrtho = new Doctor("Vikram Patel", "Orthopedics", "Room 302", 15);

        List<Doctor> doctors = doctorRepository.saveAll(List.of(drCardio, drGen, drPedia, drOrtho));

        // 2. Seed OPD Sessions
        OpdSession sessionCardio = opdSessionRepository.save(new OpdSession(drCardio));
        OpdSession sessionGen = opdSessionRepository.save(new OpdSession(drGen));
        OpdSession sessionPedia = opdSessionRepository.save(new OpdSession(drPedia));
        OpdSession sessionOrtho = opdSessionRepository.save(new OpdSession(drOrtho));

        LocalDateTime now = LocalDateTime.now();
        List<Token> tokensToSave = new ArrayList<>();

        // Helper record for token seed definition
        record SeedSpec(Doctor doctor, OpdSession session, String prefix, int number, String phone, TokenStatus status) {}

        List<SeedSpec> specs = List.of(
                // Cardiology (8 tokens: 1 Completed, 1 In-Consultation, 6 Waiting)
                new SeedSpec(drCardio, sessionCardio, "CARD", 1, "9820111001", TokenStatus.COMPLETED),
                new SeedSpec(drCardio, sessionCardio, "CARD", 2, "9820111002", TokenStatus.IN_CONSULTATION),
                new SeedSpec(drCardio, sessionCardio, "CARD", 3, "9820111003", TokenStatus.WAITING),
                new SeedSpec(drCardio, sessionCardio, "CARD", 4, "9820111004", TokenStatus.WAITING),
                new SeedSpec(drCardio, sessionCardio, "CARD", 5, "9820111005", TokenStatus.WAITING),
                new SeedSpec(drCardio, sessionCardio, "CARD", 6, "9820111006", TokenStatus.WAITING),
                new SeedSpec(drCardio, sessionCardio, "CARD", 7, "9820111007", TokenStatus.WAITING),
                new SeedSpec(drCardio, sessionCardio, "CARD", 8, "9820111008", TokenStatus.WAITING),

                // General Medicine (6 tokens: 1 In-Consultation, 5 Waiting)
                new SeedSpec(drGen, sessionGen, "GEN", 1, "9820111009", TokenStatus.IN_CONSULTATION),
                new SeedSpec(drGen, sessionGen, "GEN", 2, "9820111010", TokenStatus.WAITING),
                new SeedSpec(drGen, sessionGen, "GEN", 3, "9820111011", TokenStatus.WAITING),
                new SeedSpec(drGen, sessionGen, "GEN", 4, "9820111012", TokenStatus.WAITING),
                new SeedSpec(drGen, sessionGen, "GEN", 5, "9820111013", TokenStatus.WAITING),
                new SeedSpec(drGen, sessionGen, "GEN", 6, "9820111014", TokenStatus.WAITING),

                // Pediatrics (3 tokens: 1 Completed, 2 Waiting)
                new SeedSpec(drPedia, sessionPedia, "PED", 1, "9820111015", TokenStatus.COMPLETED),
                new SeedSpec(drPedia, sessionPedia, "PED", 2, "9820111016", TokenStatus.WAITING),
                new SeedSpec(drPedia, sessionPedia, "PED", 3, "9820111017", TokenStatus.WAITING),

                // Orthopedics (3 tokens: 1 In-Consultation, 2 Waiting)
                new SeedSpec(drOrtho, sessionOrtho, "ORTH", 1, "9820111018", TokenStatus.IN_CONSULTATION),
                new SeedSpec(drOrtho, sessionOrtho, "ORTH", 2, "9820111019", TokenStatus.WAITING),
                new SeedSpec(drOrtho, sessionOrtho, "ORTH", 3, "9820111020", TokenStatus.WAITING)
        );

        // Keep track of waiting index per session for QueueEngine calculation
        java.util.Map<Long, Integer> sessionWaitingIndex = new java.util.HashMap<>();

        for (SeedSpec spec : specs) {
            String tokenNum = String.format("%s-%03d", spec.prefix(), spec.number());
            Token token = new Token(tokenNum, spec.phone(), spec.doctor().getDepartment(), spec.doctor(), spec.session());
            token.setStatus(spec.status());

            if (spec.status() == TokenStatus.COMPLETED) {
                token.setQueuePosition(0);
                token.setPatientsAhead(0);
                token.setEstimatedWaitMinutes(0);
                token.setEstimatedConsultationTime(now.minusMinutes(30));
                QueueEngine.ArrivalWindow window = queueEngine.calculateArrivalWindow(now.minusMinutes(30));
                token.setArrivalWindowStart(window.start());
                token.setArrivalWindowEnd(window.end());
                token.setArrivalWindowFormatted(window.formatted());
            } else if (spec.status() == TokenStatus.IN_CONSULTATION) {
                token.setQueuePosition(0);
                token.setPatientsAhead(0);
                token.setEstimatedWaitMinutes(0);
                token.setEstimatedConsultationTime(now);
                QueueEngine.ArrivalWindow window = queueEngine.calculateArrivalWindow(now);
                token.setArrivalWindowStart(window.start());
                token.setArrivalWindowEnd(window.end());
                token.setArrivalWindowFormatted(window.formatted());
            } else {
                // WAITING
                int waitingIdx = sessionWaitingIndex.getOrDefault(spec.session().getId(), 0);
                int patientsAhead = waitingIdx;
                int queuePos = waitingIdx + 1;
                sessionWaitingIndex.put(spec.session().getId(), waitingIdx + 1);

                int waitMinutes = queueEngine.calculateEstimatedWaitMinutes(
                        patientsAhead,
                        spec.doctor().getAvgConsultMinutes(),
                        spec.session().getCurrentDelayMinutes(),
                        spec.session().getEmergencyAdjustmentMinutes()
                );
                LocalDateTime estTime = now.plusMinutes(waitMinutes);
                QueueEngine.ArrivalWindow window = queueEngine.calculateArrivalWindow(estTime);

                token.setPatientsAhead(patientsAhead);
                token.setQueuePosition(queuePos);
                token.setEstimatedWaitMinutes(waitMinutes);
                token.setEstimatedConsultationTime(estTime);
                token.setArrivalWindowStart(window.start());
                token.setArrivalWindowEnd(window.end());
                token.setArrivalWindowFormatted(window.formatted());
            }

            Token savedToken = tokenRepository.save(token);
            tokensToSave.add(savedToken);

            // Seed initial SMS log entry
            if (spec.status() == TokenStatus.IN_CONSULTATION) {
                smsService.sendCallNextSms(savedToken);
            } else if (spec.status() == TokenStatus.WAITING) {
                smsService.sendTokenBookedSms(savedToken);
            }
        }

        log.info("Successfully seeded {} tokens across {} doctors.", tokensToSave.size(), doctors.size());
    }
}
