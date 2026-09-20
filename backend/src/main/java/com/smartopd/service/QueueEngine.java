package com.smartopd.service;

import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Component
public class QueueEngine {

    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("hh:mm a");

    public record ArrivalWindow(LocalDateTime start, LocalDateTime end, String formatted) {}

    /**
     * Core QueueEngine estimation formula:
     * estimatedTime = patientsAhead × avgConsultMinutes + currentDelay + emergencyAdjustment
     *
     * @param patientsAhead number of patients ahead in the queue
     * @param avgConsultMinutes average doctor consultation duration in minutes
     * @param currentDelay current doctor delay in minutes
     * @param emergencyAdjustment emergency adjustment in minutes
     * @return estimated wait minutes (non-negative)
     */
    public int calculateEstimatedWaitMinutes(int patientsAhead, int avgConsultMinutes, int currentDelay, int emergencyAdjustment) {
        int estimatedMinutes = (patientsAhead * avgConsultMinutes) + currentDelay + emergencyAdjustment;
        return Math.max(0, estimatedMinutes);
    }

    /**
     * Calculates the estimated consultation timestamp based on reference time.
     */
    public LocalDateTime calculateEstimatedTime(LocalDateTime referenceTime, int patientsAhead, int avgConsultMinutes, int currentDelay, int emergencyAdjustment) {
        int waitMinutes = calculateEstimatedWaitMinutes(patientsAhead, avgConsultMinutes, currentDelay, emergencyAdjustment);
        return referenceTime.plusMinutes(waitMinutes);
    }

    /**
     * Calculates the arrival window:
     * arrival window = estimate minus 20 min to the estimate
     *
     * @param estimatedTime the estimated consultation timestamp
     * @return ArrivalWindow with start, end, and human-readable formatted string
     */
    public ArrivalWindow calculateArrivalWindow(LocalDateTime estimatedTime) {
        if (estimatedTime == null) {
            return null;
        }
        LocalDateTime windowStart = estimatedTime.minusMinutes(20);
        LocalDateTime windowEnd = estimatedTime;
        String formatted = String.format("%s - %s", windowStart.format(TIME_FORMATTER), windowEnd.format(TIME_FORMATTER));
        return new ArrivalWindow(windowStart, windowEnd, formatted);
    }
}
