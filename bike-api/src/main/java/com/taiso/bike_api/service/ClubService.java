package com.taiso.bike_api.service;

import com.taiso.bike_api.domain.ClubEntity;
import com.taiso.bike_api.domain.LightningTagCategoryEntity;
import com.taiso.bike_api.domain.UserEntity;
import com.taiso.bike_api.dto.ClubCreateRequestDTO;
import com.taiso.bike_api.repository.ClubRepository;
import com.taiso.bike_api.repository.LightningTagCategoryRepository;
import com.taiso.bike_api.repository.UserRepository;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ClubService {

    private final ClubRepository clubRepository;
    private final UserRepository userRepository;
    private final LightningTagCategoryRepository tagCategoryRepository;

    @Autowired
    public ClubService(ClubRepository clubRepository,
                       UserRepository userRepository,
                       LightningTagCategoryRepository tagCategoryRepository) {
        this.clubRepository = clubRepository;
        this.userRepository = userRepository;
        this.tagCategoryRepository = tagCategoryRepository;
    }

    public void createClub(ClubCreateRequestDTO requestDto, String email) {
        // 1. 중복 클럽명 체크
        Optional<ClubEntity> existingClub = clubRepository.findByClubName(requestDto.getClubName());
        if (existingClub.isPresent()) {
            throw new IllegalArgumentException("이미 존재하는 클럽명입니다.");
        }
        
        // 2. 현재 사용자(클럽 생성자) 조회
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        // 3. 요청된 태그 ID들을 이용해 태그 엔티티들을 조회하여 Set 구성
        Set<LightningTagCategoryEntity> tagSet = new HashSet<>();
        if (requestDto.getTags() != null) {
            requestDto.getTags().forEach(tagId -> {
                LightningTagCategoryEntity tagEntity = tagCategoryRepository.findById(tagId)
                        .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 태그 ID: " + tagId));
                tagSet.add(tagEntity);
            });
        }
        
        // 4. ClubEntity 생성 및 초기화
        ClubEntity club = ClubEntity.builder()
                .clubProfileImageId(requestDto.getClubProfileImage())
                .clubName(requestDto.getClubName())
                .clubShortDescription(requestDto.getClubShortDescription())
                // club_description은 필요시 추가할 수 있음
                .maxUser(requestDto.getMaxUser())
                .clubLeader(user)
                .tags(tagSet)
                .build();
        
        // 5. 클럽 엔티티 저장
        clubRepository.save(club);
    }
}
