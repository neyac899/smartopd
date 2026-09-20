package com.smartopd.repository;

import com.smartopd.model.Token;
import com.smartopd.model.TokenStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TokenRepository extends JpaRepository<Token, Long> {
    List<Token> findBySessionIdAndStatusOrderByQueuePositionAscIdAsc(Long sessionId, TokenStatus status);
    List<Token> findBySessionIdOrderByQueuePositionAscIdAsc(Long sessionId);
    List<Token> findByDoctorIdAndStatusOrderByQueuePositionAscIdAsc(Long doctorId, TokenStatus status);
    Optional<Token> findFirstBySessionIdAndStatusOrderByQueuePositionAsc(Long sessionId, TokenStatus status);
    Optional<Token> findFirstBySessionIdAndStatus(Long sessionId, TokenStatus status);
    long countBySessionIdAndStatus(Long sessionId, TokenStatus status);
    long countBySessionId(Long sessionId);
    List<Token> findByDepartmentIgnoreCaseOrderByQueuePositionAsc(String department);
    List<Token> findByPhoneOrderByCreatedAtDesc(String phone);
    List<Token> findAllByOrderByCreatedAtDesc();
}
