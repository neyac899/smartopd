package com.smartopd.repository;

import com.smartopd.model.Doctor;
import com.smartopd.model.OpdSession;
import com.smartopd.model.SessionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface OpdSessionRepository extends JpaRepository<OpdSession, Long> {
    Optional<OpdSession> findFirstByDoctorAndSessionDate(Doctor doctor, LocalDate sessionDate);
    Optional<OpdSession> findFirstByDoctorIdAndSessionStatusNotOrderByIdDesc(Long doctorId, SessionStatus status);
    Optional<OpdSession> findFirstByDoctorDepartmentIgnoreCaseAndSessionStatusNotOrderByIdDesc(String department, SessionStatus status);
    List<OpdSession> findBySessionStatus(SessionStatus status);
}
