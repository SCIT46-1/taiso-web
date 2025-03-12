package com.taiso.bike_api.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.taiso.bike_api.domain.ClubEntity;
import com.taiso.bike_api.domain.ClubMemberEntity;
import com.taiso.bike_api.domain.ClubMemberEntity.ParticipantStatus;
import com.taiso.bike_api.domain.UserEntity;

import jakarta.transaction.Transactional;

@Repository
public interface ClubMemberRepository extends JpaRepository<ClubMemberEntity, Long> {

	// 클럽과 유저로 존재하는지 찾기 - ClubMemberService
	Optional<ClubMemberEntity> findByClubAndUser(ClubEntity clubEntity, UserEntity userEntity);

	// 승인 숫자 세는 list - ClubMemberService
	List<ClubMemberEntity> findByClubAndParticipantStatus(ClubEntity clubEntity, ParticipantStatus 승인);

	Optional<ClubMemberEntity> findByClubAndUser_UserId(ClubEntity club, Long userId);

	// 클럽ID으로 해당 클럽 멤버 일괄 삭제 - NewClubService
	@Modifying
	@Transactional
	@Query("DELETE FROM ClubMemberEntity cm WHERE cm.club.id = :clubId")
	void deleteAllByClubId(@Param("clubId") Long clubId);

	// 유저 아이디로 참여 클럽 횟수 조회
	int countByUser_UserId(Long userId);
}
