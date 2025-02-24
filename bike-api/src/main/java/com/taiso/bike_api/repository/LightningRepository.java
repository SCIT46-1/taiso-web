package com.taiso.bike_api.repository;

import com.taiso.bike_api.domain.LightningEntity;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LightningRepository extends JpaRepository<LightningEntity, Long> {
    Optional<LightningEntity> findById(Long lightningId);
}
