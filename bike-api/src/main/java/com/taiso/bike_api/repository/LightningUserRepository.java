package com.taiso.bike_api.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.taiso.bike_api.domain.LightningEntity;
import com.taiso.bike_api.domain.LightningUserEntity;
import com.taiso.bike_api.domain.UserEntity;

@Repository
public interface LightningUserRepository extends JpaRepository<LightningUserEntity, Long> {

	// void save(LightningEntity lightningEntity);
	// 충돌로 인한 임시 주석 처리 ㅋ

	Optional<LightningUserEntity> findByLightningAndUser(LightningEntity lightningEntityException,
			UserEntity userEntityException);

	Optional<LightningUserEntity> findByLightning_LightningIdAndUser_UserId(Long lightningId, Long userId);
}
