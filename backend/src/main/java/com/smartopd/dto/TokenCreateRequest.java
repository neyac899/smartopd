package com.smartopd.dto;

import jakarta.validation.constraints.NotBlank;

public class TokenCreateRequest {

    @NotBlank(message = "Phone number is required")
    private String phone;

    @NotBlank(message = "Department is required")
    private String department;

    private Long doctorId;

    public TokenCreateRequest() {
    }

    public TokenCreateRequest(String phone, String department) {
        this.phone = phone;
        this.department = department;
    }

    public TokenCreateRequest(String phone, String department, Long doctorId) {
        this.phone = phone;
        this.department = department;
        this.doctorId = doctorId;
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

    public Long getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(Long doctorId) {
        this.doctorId = doctorId;
    }
}
