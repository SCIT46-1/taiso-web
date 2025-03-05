package com.taiso.bike_api.repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

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

    List<LightningUserEntity> findByLightningAndParticipantStatusIn(LightningEntity lightning,
            ArrayList<ParticipantStatus> arrayList);

    List<LightningUserEntity> findByUserAndParticipantStatusAndLightning_LightningStatusOrderByLightning_EventDateDesc(
            UserEntity user, List<ParticipantStatus> pStatus, List<LightningStatus> status);


}
