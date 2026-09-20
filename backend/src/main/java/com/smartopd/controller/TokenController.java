package com.smartopd.controller;

import com.smartopd.dto.TokenCreateRequest;
import com.smartopd.dto.TokenResponse;
import com.smartopd.model.Token;
import com.smartopd.service.QueueService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tokens")
public class TokenController {

    private final QueueService queueService;

    public TokenController(QueueService queueService) {
        this.queueService = queueService;
    }

    /**
     * POST /tokens
     * Issues a new queue token for a patient.
     * Supports both JSON body and request params.
     */
    @PostMapping
    public ResponseEntity<TokenResponse> createToken(
            @RequestBody(required = false) TokenCreateRequest bodyRequest,
            @RequestParam(required = false) String phone,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) Long doctorId
    ) {
        String effectivePhone = bodyRequest != null && bodyRequest.getPhone() != null 
                ? bodyRequest.getPhone() : phone;
        String effectiveDept = bodyRequest != null && bodyRequest.getDepartment() != null 
                ? bodyRequest.getDepartment() : department;
        Long effectiveDoctorId = bodyRequest != null && bodyRequest.getDoctorId() != null 
                ? bodyRequest.getDoctorId() : doctorId;

        if (effectivePhone == null || effectivePhone.isBlank()) {
            throw new IllegalArgumentException("Phone number is required");
        }
        if (effectiveDept == null || effectiveDept.isBlank()) {
            throw new IllegalArgumentException("Department is required");
        }

        Token created = queueService.bookToken(effectivePhone.trim(), effectiveDept.trim(), effectiveDoctorId);
        return ResponseEntity.status(HttpStatus.CREATED).body(TokenResponse.fromEntity(created));
    }

    /**
     * GET /tokens/{id}
     * Retrieves token status, wait time, and arrival window.
     */
    @GetMapping("/{id}")
    public ResponseEntity<TokenResponse> getTokenById(@PathVariable Long id) {
        Token token = queueService.getToken(id);
        return ResponseEntity.ok(TokenResponse.fromEntity(token));
    }

    /**
     * GET /tokens
     * Retrieves all tokens, optionally filtered by department.
     */
    @GetMapping
    public ResponseEntity<List<TokenResponse>> getAllTokens(@RequestParam(required = false) String department) {
        List<Token> list = (department != null && !department.isBlank())
                ? queueService.getTokensByDepartment(department)
                : queueService.getAllTokens();

        List<TokenResponse> responses = list.stream().map(TokenResponse::fromEntity).toList();
        return ResponseEntity.ok(responses);
    }
}
