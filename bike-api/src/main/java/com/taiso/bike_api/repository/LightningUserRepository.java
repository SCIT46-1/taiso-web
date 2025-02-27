package com.taiso.bike_api.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.taiso.bike_api.domain.LightningEntity;
import com.taiso.bike_api.domain.LightningUserEntity;
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

}
