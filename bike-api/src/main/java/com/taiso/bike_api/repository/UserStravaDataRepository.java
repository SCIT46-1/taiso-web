package com.taiso.bike_api.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.taiso.bike_api.domain.LightningEntity;
import com.taiso.bike_api.domain.UserEntity;
import com.taiso.bike_api.domain.UserStravaDataEntity;

@Repository
public interface UserStravaDataRepository extends JpaRepository<UserStravaDataEntity, Long> {

    // 사용자와 번개 모임 ID로 활동 조회
    Optional<UserStravaDataEntity> findByUserAndLightningLightningId(UserEntity user, Long lightningId);
    
    // 특정 번개 모임의 모든 활동 데이터 조회 (페이징 추가)
    Page<UserStravaDataEntity> findByLightningLightningId(Long lightningId, Pageable pageable);
    
    // 특정 번개 모임의 모든 활동 데이터 조회
    List<UserStravaDataEntity> findByLightningLightningId(Long lightningId);
    
    // 특정 사용자의 모든 활동 데이터 조회 (페이징 추가)
    Page<UserStravaDataEntity> findByUser(UserEntity user, Pageable pageable);
    
    // 특정 사용자의 모든 활동 데이터 조회
    List<UserStravaDataEntity> findByUser(UserEntity user);
    
    // 활동의 중복 등록 방지를 위한 존재 여부 확인
    boolean existsByUserAndLightningAndActivityId(UserEntity user, LightningEntity lightning, Long activityId);


    //특정 사용자의 컬럼 개수 조회
    Integer countByUser(UserEntity user);
} 