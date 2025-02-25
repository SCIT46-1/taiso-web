package com.taiso.bike_api.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.taiso.bike_api.domain.RouteLikeEntity;
@Repository
public interface RouteLikeRepository extends JpaRepository<RouteLikeEntity, Long> {

	Optional<RouteLikeEntity> findByUser_UserIdAndRoute_RouteId(Long userId, Long routeId);

	boolean existsByUser_UserIdAndRoute_RouteId(Long userId, Long routeId);
	
}
