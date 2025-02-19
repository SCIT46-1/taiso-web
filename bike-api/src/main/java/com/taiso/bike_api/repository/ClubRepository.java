package com.taiso.bike_api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import com.taiso.bike_api.domain.ClubEntity;

@Repository
public interface ClubRepository extends JpaRepository<ClubEntity, Long> {
    Optional<ClubEntity> findByClubId(Long clubId);
    Optional<ClubEntity> findByClubName(String clubName);
    Optional<ClubEntity> findById(Long clubId);

}