package com.smartopd.service;

import com.smartopd.model.SmsLog;
import com.smartopd.model.Token;
import com.smartopd.repository.SmsLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class SmsService {

    private static final Logger log = LoggerFactory.getLogger(SmsService.class);
    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("hh:mm a");

    private final SmsLogRepository smsLogRepository;

    public SmsService(SmsLogRepository smsLogRepository) {
        this.smsLogRepository = smsLogRepository;
    }

    @Transactional
    public SmsLog logSms(String phone, String tokenNumber, String message, String eventType) {
        SmsLog smsLog = new SmsLog(phone, tokenNumber, message, eventType);
        SmsLog saved = smsLogRepository.save(smsLog);
        log.info("[SMS_LOG] Sent to {}: {} (Event: {})", phone, message, eventType);
        return saved;
    }

    @Transactional
    public SmsLog sendTokenBookedSms(Token token) {
        String estTimeStr = token.getEstimatedConsultationTime() != null 
                ? token.getEstimatedConsultationTime().format(TIME_FMT) 
                : "N/A";
        String window = token.getArrivalWindowFormatted() != null 
                ? token.getArrivalWindowFormatted() 
                : "N/A";
        String message = String.format(
                "SmartOPD: Token %s confirmed for Dr. %s (%s). Position: #%d (%d ahead). Est. Time: %s. Arrival Window: %s. Room: %s.",
                token.getTokenNumber(),
                token.getDoctor().getName(),
                token.getDepartment(),
                token.getQueuePosition(),
                token.getPatientsAhead(),
                estTimeStr,
                window,
                token.getDoctor().getRoomNumber()
        );
        return logSms(token.getPhone(), token.getTokenNumber(), message, "TOKEN_BOOKED");
    }

    @Transactional
    public SmsLog sendQueueRecalculatedSms(Token token, String reason) {
        String estTimeStr = token.getEstimatedConsultationTime() != null 
                ? token.getEstimatedConsultationTime().format(TIME_FMT) 
                : "N/A";
        String window = token.getArrivalWindowFormatted() != null 
                ? token.getArrivalWindowFormatted() 
                : "N/A";
        String message = String.format(
                "SmartOPD Update [%s]: Token %s for Dr. %s. Patients ahead: %d. New Est. Time: %s. Updated Arrival Window: %s.",
                reason,
                token.getTokenNumber(),
                token.getDoctor().getName(),
                token.getPatientsAhead(),
                estTimeStr,
                window
        );
        return logSms(token.getPhone(), token.getTokenNumber(), message, "QUEUE_RECALCULATED");
    }

    @Transactional
    public SmsLog sendCallNextSms(Token token) {
        String message = String.format(
                "SmartOPD ALERT: Token %s! Dr. %s is ready for consultation in %s. Please proceed to the room immediately.",
                token.getTokenNumber(),
                token.getDoctor().getName(),
                token.getDoctor().getRoomNumber()
        );
        return logSms(token.getPhone(), token.getTokenNumber(), message, "CALLED_NEXT");
    }

    @Transactional
    public SmsLog sendRequeuedSms(Token token) {
        String window = token.getArrivalWindowFormatted() != null ? token.getArrivalWindowFormatted() : "N/A";
        String message = String.format(
                "SmartOPD: Token %s has been requeued with Dr. %s. New Queue Position: #%d (%d ahead). New Arrival Window: %s.",
                token.getTokenNumber(),
                token.getDoctor().getName(),
                token.getQueuePosition(),
                token.getPatientsAhead(),
                window
        );
        return logSms(token.getPhone(), token.getTokenNumber(), message, "REQUEUED");
    }

    @Transactional(readOnly = true)
    public List<SmsLog> getAllLogs() {
        return smsLogRepository.findAllByOrderBySentAtDesc();
    }

    @Transactional(readOnly = true)
    public List<SmsLog> getLogsByToken(String tokenNumber) {
        return smsLogRepository.findByTokenNumberOrderBySentAtDesc(tokenNumber);
    }
}
