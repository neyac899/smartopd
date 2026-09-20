package com.smartopd.dto;

import com.smartopd.model.Token;
import com.smartopd.model.TokenStatus;

import java.time.LocalDateTime;

public record TokenResponse(
        Long id,
        String tokenNumber,
        String phone,
        String department,
        Long doctorId,
        String doctorName,
        String roomNumber,
        int avgConsultMinutes,
        Long sessionId,
        TokenStatus status,
        Integer queuePosition,
        Integer patientsAhead,
        Integer estimatedWaitMinutes,
        LocalDateTime estimatedConsultationTime,
        LocalDateTime arrivalWindowStart,
        LocalDateTime arrivalWindowEnd,
        String arrivalWindowFormatted,
        boolean sessionPaused,
        int currentDelayMinutes,
        int emergencyAdjustmentMinutes,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static TokenResponse fromEntity(Token token) {
        if (token == null) {
            return null;
        }
        return new TokenResponse(
                token.getId(),
                token.getTokenNumber(),
                token.getPhone(),
                token.getDepartment(),
                token.getDoctor() != null ? token.getDoctor().getId() : null,
                token.getDoctor() != null ? token.getDoctor().getName() : null,
                token.getDoctor() != null ? token.getDoctor().getRoomNumber() : null,
                token.getDoctor() != null ? token.getDoctor().getAvgConsultMinutes() : 0,
                token.getSession() != null ? token.getSession().getId() : null,
                token.getStatus(),
                token.getQueuePosition(),
                token.getPatientsAhead(),
                token.getEstimatedWaitMinutes(),
                token.getEstimatedConsultationTime(),
                token.getArrivalWindowStart(),
                token.getArrivalWindowEnd(),
                token.getArrivalWindowFormatted(),
                token.getSession() != null && token.getSession().isPaused(),
                token.getSession() != null ? token.getSession().getCurrentDelayMinutes() : 0,
                token.getSession() != null ? token.getSession().getEmergencyAdjustmentMinutes() : 0,
                token.getCreatedAt(),
                token.getUpdatedAt()
        );
    }
}
