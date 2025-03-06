package com.taiso.bike_api.repository;

import com.taiso.bike_api.domain.LightningEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.taiso.bike_api.domain.ClubBoardEntity;

@Repository
public interface ClubBoardRepository extends JpaRepository<ClubBoardEntity, Long> {
    Page<ClubBoardEntity> findAll(Specification<ClubBoardEntity> spec, Pageable pageable);

}
