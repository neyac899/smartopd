package com.smartopd.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tokens")
public class Token {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String tokenNumber;

    @Column(nullable = false)
    private String phone;

    @Column(nullable = false)
    private String department;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "session_id", nullable = false)
    private OpdSession session;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TokenStatus status = TokenStatus.WAITING;

    @Column(nullable = false)
    private Integer queuePosition = 1;

    @Column(nullable = false)
    private Integer patientsAhead = 0;

    @Column(nullable = false)
    private Integer estimatedWaitMinutes = 0;

    private LocalDateTime estimatedConsultationTime;
    private LocalDateTime arrivalWindowStart;
    private LocalDateTime arrivalWindowEnd;

    private String arrivalWindowFormatted;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    public Token() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public Token(String tokenNumber, String phone, String department, Doctor doctor, OpdSession session) {
        this.tokenNumber = tokenNumber;
        this.phone = phone;
        this.department = department;
        this.doctor = doctor;
        this.session = session;
        this.status = TokenStatus.WAITING;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PrePersist
    public void onPrePersist() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void onPreUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTokenNumber() {
        return tokenNumber;
    }

    public void setTokenNumber(String tokenNumber) {
        this.tokenNumber = tokenNumber;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public Doctor getDoctor() {
        return doctor;
    }

    public void setDoctor(Doctor doctor) {
        this.doctor = doctor;
    }

    public OpdSession getSession() {
        return session;
    }

    public void setSession(OpdSession session) {
        this.session = session;
    }

    public TokenStatus getStatus() {
        return status;
    }

    public void setStatus(TokenStatus status) {
        this.status = status;
    }

    public Integer getQueuePosition() {
        return queuePosition;
    }

    public void setQueuePosition(Integer queuePosition) {
        this.queuePosition = queuePosition;
    }

    public Integer getPatientsAhead() {
        return patientsAhead;
    }

    public void setPatientsAhead(Integer patientsAhead) {
        this.patientsAhead = patientsAhead;
    }

    public Integer getEstimatedWaitMinutes() {
        return estimatedWaitMinutes;
    }

    public void setEstimatedWaitMinutes(Integer estimatedWaitMinutes) {
        this.estimatedWaitMinutes = estimatedWaitMinutes;
    }

    public LocalDateTime getEstimatedConsultationTime() {
        return estimatedConsultationTime;
    }

    public void setEstimatedConsultationTime(LocalDateTime estimatedConsultationTime) {
        this.estimatedConsultationTime = estimatedConsultationTime;
    }

    public LocalDateTime getArrivalWindowStart() {
        return arrivalWindowStart;
    }

    public void setArrivalWindowStart(LocalDateTime arrivalWindowStart) {
        this.arrivalWindowStart = arrivalWindowStart;
    }

    public LocalDateTime getArrivalWindowEnd() {
        return arrivalWindowEnd;
    }

    public void setArrivalWindowEnd(LocalDateTime arrivalWindowEnd) {
        this.arrivalWindowEnd = arrivalWindowEnd;
    }

    public String getArrivalWindowFormatted() {
        return arrivalWindowFormatted;
    }

    public void setArrivalWindowFormatted(String arrivalWindowFormatted) {
        this.arrivalWindowFormatted = arrivalWindowFormatted;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
