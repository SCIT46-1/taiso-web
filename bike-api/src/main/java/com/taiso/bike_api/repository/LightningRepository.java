package com.taiso.bike_api.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import com.taiso.bike_api.domain.LightningEntity;
import com.taiso.bike_api.domain.LightningEntity.LightningStatus;

public interface LightningRepository extends JpaRepository<LightningEntity, Long>, JpaSpecificationExecutor<LightningEntity>{
    Page<LightningEntity> findAll(Specification<LightningEntity> spec, Pageable pageable);
    
    // 특정 상태들과 날짜 기준으로 번개 이벤트 조회
    List<LightningEntity> findByStatusInAndEventDateBefore(
            List<LightningStatus> statuses,
            LocalDateTime date
    );

    // 특정 상태인 이벤트 중 주어진 시간 범위 내에 시작하는 이벤트 조회
    List<LightningEntity> findByStatusAndEventDateBetween(
            LightningStatus status,
            LocalDateTime startTime,
            LocalDateTime endTime
    );

    // 일괄 업데이트를 위한 쿼리 메서드 추가
    @Modifying
    @Query("UPDATE LightningEntity l SET l.status = :newStatus WHERE l.status = :currentStatus AND l.eventDate BETWEEN :startTime AND :endTime")
    int updateStatusForUpcomingEvents(
            LightningStatus currentStatus,
            LightningStatus newStatus,
            LocalDateTime startTime,
            LocalDateTime endTime
    );

	// 클럽 번개 리스트 조회 repository
	List<LightningEntity> findByClubId(Long clubId);
	
}
