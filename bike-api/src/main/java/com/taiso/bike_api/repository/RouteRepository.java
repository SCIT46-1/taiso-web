package com.taiso.bike_api.repository;


import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.taiso.bike_api.domain.RouteEntity;
import com.taiso.bike_api.domain.UserEntity;

public interface RouteRepository extends JpaRepository<RouteEntity, Long>, JpaSpecificationExecutor<RouteEntity> {
  RouteEntity findByRouteId(Long routeId);

	Optional<UserEntity> findByRouteId(Long targetId);
}
