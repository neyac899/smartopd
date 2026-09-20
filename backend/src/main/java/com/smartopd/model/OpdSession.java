package com.smartopd.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "opd_sessions")
public class OpdSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @Column(nullable = false)
    private LocalDate sessionDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SessionStatus sessionStatus = SessionStatus.ACTIVE;

    @Column(nullable = false)
    private boolean isPaused = false;

    @Column(nullable = false)
    private int currentDelayMinutes = 0;

    @Column(nullable = false)
    private int emergencyAdjustmentMinutes = 0;

    @Column(nullable = false)
    private LocalDateTime startedAt;

    public OpdSession() {
        this.sessionDate = LocalDate.now();
        this.startedAt = LocalDateTime.now();
        this.sessionStatus = SessionStatus.ACTIVE;
    }

    public OpdSession(Doctor doctor) {
        this.doctor = doctor;
        this.sessionDate = LocalDate.now();
        this.startedAt = LocalDateTime.now();
        this.sessionStatus = SessionStatus.ACTIVE;
        this.isPaused = false;
        this.currentDelayMinutes = 0;
        this.emergencyAdjustmentMinutes = 0;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Doctor getDoctor() {
        return doctor;
    }

    public void setDoctor(Doctor doctor) {
        this.doctor = doctor;
    }

    public LocalDate getSessionDate() {
        return sessionDate;
    }

    public void setSessionDate(LocalDate sessionDate) {
        this.sessionDate = sessionDate;
    }

    public SessionStatus getSessionStatus() {
        return sessionStatus;
    }

    public void setSessionStatus(SessionStatus sessionStatus) {
        this.sessionStatus = sessionStatus;
    }

    public boolean isPaused() {
        return isPaused;
    }

    public void setPaused(boolean paused) {
        isPaused = paused;
        if (paused) {
            this.sessionStatus = SessionStatus.PAUSED;
        } else if (this.sessionStatus == SessionStatus.PAUSED) {
            this.sessionStatus = SessionStatus.ACTIVE;
        }
    }

    public int getCurrentDelayMinutes() {
        return currentDelayMinutes;
    }

    public void setCurrentDelayMinutes(int currentDelayMinutes) {
        this.currentDelayMinutes = currentDelayMinutes;
    }

    public int getEmergencyAdjustmentMinutes() {
        return emergencyAdjustmentMinutes;
    }

    public void setEmergencyAdjustmentMinutes(int emergencyAdjustmentMinutes) {
        this.emergencyAdjustmentMinutes = emergencyAdjustmentMinutes;
    }

    public LocalDateTime getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(LocalDateTime startedAt) {
        this.startedAt = startedAt;
    }
}
