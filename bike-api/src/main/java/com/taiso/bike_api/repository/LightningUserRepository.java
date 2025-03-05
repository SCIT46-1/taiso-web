package com.taiso.bike_api.repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.taiso.bike_api.domain.LightningEntity;
import com.taiso.bike_api.domain.LightningEntity.LightningStatus;
import com.taiso.bike_api.domain.LightningUserEntity;
import com.taiso.bike_api.domain.LightningUserEntity.ParticipantStatus;
import com.taiso.bike_api.domain.UserDetailEntity;
import com.taiso.bike_api.domain.UserEntity;

public interface LightningUserRepository extends JpaRepository<LightningUserEntity, Long> {

	// initLoader 생성
    void save(LightningEntity lightningEntity);

    Optional<LightningUserEntity> findByLightningAndUser(LightningEntity lightningEntityException,
            UserEntity userEntityException);

	Optional<LightningUserEntity> findByLightning_LightningIdAndUser_UserId(Long lightningId, Long userId);

	// CompletedReviews
	Optional<LightningUserEntity> findByLightningAndUser(LightningEntity lightning, UserDetailEntity reviewed);
  
    List<LightningUserEntity> findAllByLightning_LightningId(Long lightningId);

    
    // 번개 ID로 참여자 수를 조회하는 메소드 추가
    int countByLightning_LightningId(Long lightningId);

    Optional<LightningUserEntity> findByLightning(LightningEntity lightning);

    List<LightningUserEntity> findByUserAndParticipantStatusIn(UserEntity user, List<ParticipantStatus> status);

    List<LightningUserEntity> findByLightningAndParticipantStatusIn(LightningEntity lightning,
            ArrayList<ParticipantStatus> arrayList);


    //번개 id 로 현재 승인, 완료된 참여자 수를 조회하는 메서드
    int countByLightning_LightningIdAndParticipantStatusIn(Long lightningId, List<ParticipantStatus> status);

    //승인 및 완료 상태의 참여자만 직접 카운트하는 메서드
    @Query("SELECT COUNT(lu) FROM LightningUserEntity lu WHERE lu.lightning.lightningId = :lightningId AND lu.participantStatus IN ('승인', '완료')")
    int countByLightning_LightningIdAndParticipantStatusInApprovedAndCompleted(@Param("lightningId") Long lightningId);


    //유저아이디랑 번개아이디로 참여자 조회
    Optional<LightningUserEntity> findByUser_UserIdAndLightning_LightningId(Long userId, Long lightningId);

    List<LightningUserEntity> findByUserAndParticipantStatusInAndLightning_StatusInOrderByLightning_EventDateDesc(
            UserEntity user, List<ParticipantStatus> pStatus, List<LightningStatus> status);
}
