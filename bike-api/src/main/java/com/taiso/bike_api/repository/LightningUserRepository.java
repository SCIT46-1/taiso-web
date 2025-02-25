package com.taiso.bike_api.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.taiso.bike_api.domain.LightningEntity;
import com.taiso.bike_api.domain.LightningUserEntity;
import com.taiso.bike_api.domain.UserEntity;

@Repository
public interface LightningUserRepository extends JpaRepository<LightningUserEntity, Long> {
    List<LightningUserEntity> findByUser(UserEntity user);


    void save(LightningEntity lightningEntity);

    Optional<LightningUserEntity> findByLightningAndUser(LightningEntity lightningEntityException,
            UserEntity userEntityException);

	Optional<LightningUserEntity> findByLightning_LightningIdAndUser_UserId(Long lightningId, Long userId);


}
