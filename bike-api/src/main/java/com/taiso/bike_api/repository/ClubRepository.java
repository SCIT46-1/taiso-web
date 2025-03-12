package com.taiso.bike_api.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.taiso.bike_api.domain.ClubEntity;
import com.taiso.bike_api.domain.ClubMemberEntity.ParticipantStatus;
@Repository
public interface ClubRepository extends JpaRepository<ClubEntity, Long> {

    Optional<ClubEntity> findByClubName(String clubName);

    List<ClubEntity> findAllByClubIdIn(List<Long> collect);

    Optional<ClubEntity> findByClubId(Long clubId);

    Page<ClubEntity> findAll(Specification<ClubEntity> specification, Pageable pageable);

    Page<ClubEntity> findAllByClubIdIn(List<Long> collect, Pageable pageable);

    //유저 아이디로 가입한 클럽 리스트 중에 상태가 완료 또는 승인인 클럽 리스트 조회    
    List<ClubEntity> findAllByUsers_User_UserIdAndUsers_ParticipantStatus(Long userId, ParticipantStatus participantStatus);
    
}
