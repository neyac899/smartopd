package com.smartopd.dto;

import com.smartopd.model.SessionStatus;

public record StaffActionResponse(
        boolean success,
        String message,
        String action,
        int affectedTokensCount,
        Long sessionId,
        SessionStatus sessionStatus,
        int currentDelayMinutes,
        int emergencyAdjustmentMinutes,
        TokenResponse currentToken
) {
    public static StaffActionResponse success(String action, String message, int affectedCount, Long sessionId, SessionStatus status, int delay, int emergency, TokenResponse currentToken) {
        return new StaffActionResponse(true, message, action, affectedCount, sessionId, status, delay, emergency, currentToken);
    }

    public static StaffActionResponse error(String action, String message) {
        return new StaffActionResponse(false, message, action, 0, null, null, 0, 0, null);
    }
}
