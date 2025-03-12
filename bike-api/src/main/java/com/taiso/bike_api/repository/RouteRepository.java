package com.taiso.bike_api.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.taiso.bike_api.domain.RouteEntity;

public interface RouteRepository extends JpaRepository<RouteEntity, Long>, JpaSpecificationExecutor<RouteEntity> {
  RouteEntity findByRouteId(Long routeId);

  // 유저 아이디로 등록 루트 횟수 조회
  int countByUserId(Long userId);
}
