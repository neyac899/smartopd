package com.smartopd.controller;

import com.smartopd.dto.StaffActionResponse;
import com.smartopd.dto.TokenResponse;
import com.smartopd.model.SmsLog;
import com.smartopd.model.Token;
import com.smartopd.service.QueueService;
import com.smartopd.service.SmsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping
public class StaffController {

    private final QueueService queueService;
    private final SmsService smsService;

    public StaffController(QueueService queueService, SmsService smsService) {
        this.queueService = queueService;
        this.smsService = smsService;
    }

    /**
     * POST /staff/call-next
     * Advances the queue, marks previous in-consultation as completed,
     * calls next waiting patient, and recalculates remaining waiting tokens.
     */
    @PostMapping("/staff/call-next")
    public ResponseEntity<StaffActionResponse> callNext(
            @RequestParam(required = false) Long doctorId,
            @RequestParam(required = false) Long sessionId
    ) {
        StaffActionResponse response = queueService.callNext(doctorId, sessionId);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /staff/pause
     * Toggles pause status of the doctor's OPD session.
     */
    @PostMapping("/staff/pause")
    public ResponseEntity<StaffActionResponse> pauseSession(
            @RequestParam(required = false) Long doctorId,
            @RequestParam(required = false) Long sessionId
    ) {
        StaffActionResponse response = queueService.togglePause(doctorId, sessionId);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /staff/doctor-delay?minutes=
     * Adds delay minutes to the session, recalculates all waiting tokens, and logs SMS.
     */
    @PostMapping("/staff/doctor-delay")
    public ResponseEntity<StaffActionResponse> addDoctorDelay(
            @RequestParam(defaultValue = "10") int minutes,
            @RequestParam(required = false) Long doctorId,
            @RequestParam(required = false) Long sessionId
    ) {
        StaffActionResponse response = queueService.addDoctorDelay(doctorId, sessionId, minutes);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /staff/emergency?minutes=
     * Adds emergency adjustment minutes to the session, recalculates all waiting tokens, and logs SMS.
     */
    @PostMapping("/staff/emergency")
    public ResponseEntity<StaffActionResponse> addEmergency(
            @RequestParam(defaultValue = "15") int minutes,
            @RequestParam(required = false) Long doctorId,
            @RequestParam(required = false) Long sessionId
    ) {
        StaffActionResponse response = queueService.addEmergencyAdjustment(doctorId, sessionId, minutes);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /staff/requeue/{id}
     * Requeues a token at the end of the waiting queue, recalculating all waiting tokens and logging SMS.
     */
    @PostMapping("/staff/requeue/{id}")
    public ResponseEntity<StaffActionResponse> requeueToken(@PathVariable Long id) {
        StaffActionResponse response = queueService.requeueToken(id);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /staff/sms-logs or GET /sms-logs
     * Returns all SMS logs from the sms_log table.
     */
    @GetMapping({"/staff/sms-logs", "/sms-logs"})
    public ResponseEntity<List<SmsLog>> getSmsLogs(@RequestParam(required = false) String tokenNumber) {
        List<SmsLog> logs = (tokenNumber != null && !tokenNumber.isBlank())
                ? smsService.getLogsByToken(tokenNumber)
                : smsService.getAllLogs();
        return ResponseEntity.ok(logs);
    }

    /**
     * GET /staff/queue
     * Provides an overview of all active tokens in the queue.
     */
    @GetMapping("/staff/queue")
    public ResponseEntity<List<TokenResponse>> getQueueOverview() {
        List<Token> all = queueService.getAllTokens();
        return ResponseEntity.ok(all.stream().map(TokenResponse::fromEntity).toList());
    }
}
