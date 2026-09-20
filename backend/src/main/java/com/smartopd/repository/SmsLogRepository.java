package com.smartopd.repository;

import com.smartopd.model.SmsLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SmsLogRepository extends JpaRepository<SmsLog, Long> {
    List<SmsLog> findAllByOrderBySentAtDesc();
    List<SmsLog> findByTokenNumberOrderBySentAtDesc(String tokenNumber);
    List<SmsLog> findByPhoneOrderBySentAtDesc(String phone);
}
