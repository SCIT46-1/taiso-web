package com.taiso.bike_api.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.taiso.bike_api.domain.LightningEntity;

public interface LightningRepository extends JpaRepository<LightningEntity, Long>, JpaSpecificationExecutor<LightningEntity>{
    Page<LightningEntity> findAll(Specification<LightningEntity> spec, Pageable pageable);
}
