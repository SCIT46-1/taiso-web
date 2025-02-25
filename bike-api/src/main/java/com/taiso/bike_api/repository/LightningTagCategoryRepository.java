package com.taiso.bike_api.repository;


import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.taiso.bike_api.domain.LightningTagCategoryEntity;

public interface LightningTagCategoryRepository extends JpaRepository<LightningTagCategoryEntity, Long> {

    Optional<LightningTagCategoryEntity> findByName(String tagName);
    
}
