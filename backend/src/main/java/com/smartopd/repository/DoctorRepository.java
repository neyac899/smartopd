package com.smartopd.repository;

import com.smartopd.model.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    List<Doctor> findByDepartmentIgnoreCase(String department);
    Optional<Doctor> findFirstByDepartmentIgnoreCaseAndActiveTrue(String department);
    List<Doctor> findByActiveTrue();
}
