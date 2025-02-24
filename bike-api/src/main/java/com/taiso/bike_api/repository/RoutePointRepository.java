package com.taiso.bike_api.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.taiso.bike_api.domain.RouteEntity;
import com.taiso.bike_api.domain.RoutePointEntity;

@Repository
public interface RoutePointRepository extends JpaRepository<RoutePointEntity, Long> {
        // route에 해당하는 포인트를 sequence 순으로 조회
    List<RoutePointEntity> findByRouteOrderBySequenceAsc(RouteEntity route);
} 