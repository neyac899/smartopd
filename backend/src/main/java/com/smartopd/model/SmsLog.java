package com.smartopd.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "sms_log")
public class SmsLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String phone;

    @Column(nullable = false)
    private String tokenNumber;

    @Column(nullable = false, length = 1000)
    private String message;

    @Column(nullable = false)
    private String eventType;

    @Column(nullable = false)
    private LocalDateTime sentAt;

    @Column(nullable = false)
    private String status = "SENT";

    public SmsLog() {
        this.sentAt = LocalDateTime.now();
    }

    public SmsLog(String phone, String tokenNumber, String message, String eventType) {
        this.phone = phone;
        this.tokenNumber = tokenNumber;
        this.message = message;
        this.eventType = eventType;
        this.sentAt = LocalDateTime.now();
        this.status = "SENT";
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getTokenNumber() {
        return tokenNumber;
    }

    public void setTokenNumber(String tokenNumber) {
        this.tokenNumber = tokenNumber;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getEventType() {
        return eventType;
    }

    public void setEventType(String eventType) {
        this.eventType = eventType;
    }

    public LocalDateTime getSentAt() {
        return sentAt;
    }

    public void setSentAt(LocalDateTime sentAt) {
        this.sentAt = sentAt;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
