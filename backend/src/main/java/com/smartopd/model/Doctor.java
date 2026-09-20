package com.smartopd.model;

import jakarta.persistence.*;

@Entity
@Table(name = "doctors")
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String department;

    @Column(nullable = false)
    private String roomNumber;

    @Column(nullable = false)
    private int avgConsultMinutes = 15;

    @Column(nullable = false)
    private boolean active = true;

    public Doctor() {
    }

    public Doctor(String name, String department, String roomNumber, int avgConsultMinutes) {
        this.name = name;
        this.department = department;
        this.roomNumber = roomNumber;
        this.avgConsultMinutes = avgConsultMinutes;
        this.active = true;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getRoomNumber() {
        return roomNumber;
    }

    public void setRoomNumber(String roomNumber) {
        this.roomNumber = roomNumber;
    }

    public int getAvgConsultMinutes() {
        return avgConsultMinutes;
    }

    public void setAvgConsultMinutes(int avgConsultMinutes) {
        this.avgConsultMinutes = avgConsultMinutes;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}
