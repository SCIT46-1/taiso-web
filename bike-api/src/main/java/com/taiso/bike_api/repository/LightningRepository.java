package com.taiso.bike_api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.taiso.bike_api.domain.LightningEntity;

@Repository
public interface LightningRepository extends JpaRepository<LightningEntity, Long>, JpaSpecificationExecutor<LightningEntity>{
    
}
