package com.taiso.bike_api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

import com.taiso.bike_api.domain.ClubEntity;
import com.taiso.bike_api.domain.ClubMemberEntity;
import com.taiso.bike_api.domain.UserEntity;

@Repository
public interface ClubMemberRepository extends JpaRepository<ClubMemberEntity, Long> {
    Optional<ClubMemberEntity> findByUserAndClub(UserEntity user, ClubEntity club);
    List<ClubMemberEntity> findByClub(ClubEntity club);
}