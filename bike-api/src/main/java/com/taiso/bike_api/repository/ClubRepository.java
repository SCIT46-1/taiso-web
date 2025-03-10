package com.taiso.bike_api.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.taiso.bike_api.domain.ClubEntity;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClubRepository extends JpaRepository<ClubEntity, Long> {

    Optional<ClubEntity> findByClubName(String clubName);

    List<ClubEntity> findAllByClubIdIn(List<Long> collect);

    Optional<ClubEntity> findByClubId(Long clubId);

    Page<ClubEntity> findAll(Specification<ClubEntity> specification, Pageable pageable);

    Page<ClubEntity> findAllByClubIdIn(List<Long> collect, Pageable pageable);
}
