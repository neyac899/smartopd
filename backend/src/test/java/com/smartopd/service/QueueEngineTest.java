package com.smartopd.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class QueueEngineTest {

    private QueueEngine queueEngine;

    @BeforeEach
    void setUp() {
        queueEngine = new QueueEngine();
    }

    @Test
    @DisplayName("Should return 0 wait time when 0 patients are ahead and no delays")
    void testZeroPatientsAheadNoDelay() {
        int waitMinutes = queueEngine.calculateEstimatedWaitMinutes(0, 15, 0, 0);
        assertEquals(0, waitMinutes, "Wait time should be 0 when 0 patients ahead and no delays");
    }

    @Test
    @DisplayName("Should calculate base wait time: patientsAhead * avgConsultMinutes")
    void testBaseWaitTimeCalculation() {
        // 3 patients ahead, 15 minutes consult time
        int waitMinutes = queueEngine.calculateEstimatedWaitMinutes(3, 15, 0, 0);
        assertEquals(45, waitMinutes, "3 patients ahead × 15 min = 45 min");

        // 5 patients ahead, 10 minutes consult time
        int waitMinutes2 = queueEngine.calculateEstimatedWaitMinutes(5, 10, 0, 0);
        assertEquals(50, waitMinutes2, "5 patients ahead × 10 min = 50 min");
    }

    @Test
    @DisplayName("Should add doctor delay to estimated wait time")
    void testDoctorDelayAddition() {
        // 2 patients ahead, 15 min consult, 20 min doctor delay
        int waitMinutes = queueEngine.calculateEstimatedWaitMinutes(2, 15, 20, 0);
        assertEquals(50, waitMinutes, "2 × 15 + 20 = 50 min");
    }

    @Test
    @DisplayName("Should add emergency adjustment to estimated wait time")
    void testEmergencyAdjustmentAddition() {
        // 1 patient ahead, 12 min consult, 25 min emergency
        int waitMinutes = queueEngine.calculateEstimatedWaitMinutes(1, 12, 0, 25);
        assertEquals(37, waitMinutes, "1 × 12 + 25 = 37 min");
    }

    @Test
    @DisplayName("Should combine patientsAhead, avgConsultMinutes, currentDelay, and emergencyAdjustment")
    void testCombinedFormula() {
        // Formula: patientsAhead × avgConsultMinutes + currentDelay + emergencyAdjustment
        // 4 patients × 10 min + 15 min delay + 30 min emergency = 40 + 15 + 30 = 85 min
        int waitMinutes = queueEngine.calculateEstimatedWaitMinutes(4, 10, 15, 30);
        assertEquals(85, waitMinutes);
    }

    @Test
    @DisplayName("Should clamp wait time to 0 if negative adjustments exceed wait time")
    void testNegativeClamping() {
        int waitMinutes = queueEngine.calculateEstimatedWaitMinutes(0, 10, -15, 0);
        assertEquals(0, waitMinutes, "Wait time should not be negative");
    }

    @Test
    @DisplayName("Should calculate estimated consultation timestamp correctly")
    void testCalculateEstimatedTime() {
        LocalDateTime refTime = LocalDateTime.of(2026, 9, 20, 10, 0, 0);
        // 2 patients × 15 min = 30 min wait
        LocalDateTime estTime = queueEngine.calculateEstimatedTime(refTime, 2, 15, 0, 0);
        LocalDateTime expected = LocalDateTime.of(2026, 9, 20, 10, 30, 0);

        assertEquals(expected, estTime);
    }

    @Test
    @DisplayName("Should calculate arrival window as estimate minus 20 min to estimate")
    void testArrivalWindowCalculation() {
        // Given an estimated consultation time of 11:30 AM
        LocalDateTime estTime = LocalDateTime.of(2026, 9, 20, 11, 30, 0);

        QueueEngine.ArrivalWindow window = queueEngine.calculateArrivalWindow(estTime);

        assertNotNull(window);
        assertEquals(LocalDateTime.of(2026, 9, 20, 11, 10, 0), window.start(),
                "Arrival window start must be exactly 20 minutes before estimated time");
        assertEquals(estTime, window.end(),
                "Arrival window end must match estimated time");
        assertTrue(window.formatted().contains("11:10") && window.formatted().contains("11:30"),
                "Arrival window formatted string should contain start and end times");
    }

    @Test
    @DisplayName("Arrival window should handle null gracefully")
    void testArrivalWindowNullHandling() {
        assertNull(queueEngine.calculateArrivalWindow(null));
    }
}
