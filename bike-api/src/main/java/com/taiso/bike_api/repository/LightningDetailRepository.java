package com.taiso.bike_api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.taiso.bike_api.domain.LightningEntity;

@Repository
public interface LightningDetailRepository extends JpaRepository<LightningEntity, Long> {

//    Optional<LightningEntity> existsByUser_UserIdAndLightning_CreatorId(Long userId, Long creatorId);

//    Boolean existsByUser_UserIdAndLightning_CreatorId(Long userId, Long creatorId);

}