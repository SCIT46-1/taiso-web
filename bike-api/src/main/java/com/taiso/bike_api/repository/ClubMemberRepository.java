package com.taiso.bike_api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

import com.taiso.bike_api.domain.ClubEntity;
import com.taiso.bike_api.domain.ClubMemberEntity;
import com.taiso.bike_api.domain.LightningTagCategoryEntity;
import com.taiso.bike_api.domain.UserEntity;

@Repository
public interface ClubMemberRepository extends JpaRepository<ClubMemberEntity, Long> {
    Optional<ClubMemberEntity> findByUserAndClub(UserEntity user, ClubEntity club);
    List<ClubMemberEntity> findByClub(ClubEntity club);

    // 특정 클럽에 속한 회원 수를 계산하는 메서드
    Long countByClub(ClubEntity club);

    // 클럽에 가입한 회원들을 조회하고, 클럽별 가입 인원(= currentScale)을 계산하기 위해 countByClub 메서드를 추가합니다.
    // ClubEntity 내의 tags 필드는 Set<LightningTagCategoryEntity>로 선언되어 있으므로,
    // 각 태그의 식별자(예: tagId)를 추출하여 응답 DTO에 담습니다.
    // LightningTagCategoryEntity는 별도로 정의되어 있어야 하며, tagId 필드가 있다고 가정합니다.
}