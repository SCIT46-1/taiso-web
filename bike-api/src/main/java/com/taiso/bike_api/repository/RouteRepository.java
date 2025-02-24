package com.taiso.bike_api.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.taiso.bike_api.domain.RouteEntity;

@Repository
public interface RouteRepository extends JpaRepository<RouteEntity, Long>, JpaSpecificationExecutor<RouteEntity> {
}
