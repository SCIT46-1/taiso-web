package com.taiso.bike_api.repository;

import com.taiso.bike_api.domain.RouteEntity;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RouteRepository extends JpaRepository<RouteEntity, Long> {
    Optional<RouteEntity> findById(Long routeId);
}
