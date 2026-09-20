package com.smartopd.controller;

import com.smartopd.model.Doctor;
import com.smartopd.service.QueueService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/doctors")
public class DoctorController {

    private final QueueService queueService;

    public DoctorController(QueueService queueService) {
        this.queueService = queueService;
    }

    @GetMapping
    public ResponseEntity<List<Doctor>> getAllDoctors() {
        return ResponseEntity.ok(queueService.getAllDoctors());
    }
}
