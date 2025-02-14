package com.taiso.bike_api.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.taiso.bike_api.domain.UserTagCategoryEntity;

public interface UserTagCategoryRepository extends JpaRepository<UserTagCategoryEntity, Long> {
    
}
