package com.taiso.bike_api.repository;

import com.taiso.bike_api.domain.RouteLikeEntity;
import com.taiso.bike_api.domain.RouteEntity;
import com.taiso.bike_api.domain.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RouteLikeRepository extends JpaRepository<RouteLikeEntity, Long> {

    Optional<RouteLikeEntity> findByRouteAndUser(RouteEntity route, UserEntity user);
}
