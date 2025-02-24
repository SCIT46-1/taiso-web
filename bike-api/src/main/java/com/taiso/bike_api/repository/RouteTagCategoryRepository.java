package com.taiso.bike_api.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.taiso.bike_api.domain.RouteTagCategoryEntity;

@Repository
public interface RouteTagCategoryRepository extends JpaRepository<RouteTagCategoryEntity, Long> {
    Optional<RouteTagCategoryEntity> findByName(String name);
} 