package com.taiso.bike_api.service;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import com.taiso.bike_api.domain.ClubEntity;
import com.taiso.bike_api.domain.ClubMemberEntity;
import com.taiso.bike_api.domain.LightningTagCategoryEntity;
import com.taiso.bike_api.domain.UserDetailEntity;
import com.taiso.bike_api.domain.UserEntity;
import com.taiso.bike_api.dto.ClubCreateRequestDTO;
import com.taiso.bike_api.dto.ClubDetailResponseDTO;
import com.taiso.bike_api.dto.ClubInfoUpdateRequestDTO;
import com.taiso.bike_api.dto.ClubInfoUpdateResponseDTO;
import com.taiso.bike_api.dto.ClubListItemDTO;
import com.taiso.bike_api.dto.ClubMemberDTO;
import com.taiso.bike_api.dto.ClubUpdateRequestDTO;
import com.taiso.bike_api.repository.ClubMemberRepository;
import com.taiso.bike_api.repository.ClubRepository;
import com.taiso.bike_api.repository.LightningTagCategoryRepository;
import com.taiso.bike_api.repository.UserDetailRepository;
import com.taiso.bike_api.repository.UserRepository;


@Service
public class ClubService {

    private final ClubRepository clubRepository;
    private final ClubMemberRepository clubMemberRepository;
    private final UserRepository userRepository;
    private final UserDetailRepository userDetailRepository;
    private final LightningTagCategoryRepository tagCategoryRepository;

    @Autowired
    public ClubService(ClubRepository clubRepository,
                    ClubMemberRepository clubMemberRepository,
                    UserRepository userRepository,
                    UserDetailRepository userDetailRepository,
                    LightningTagCategoryRepository tagCategoryRepository) {
        this.clubRepository = clubRepository;
        this.clubMemberRepository = clubMemberRepository;
        this.userRepository = userRepository;
        this.userDetailRepository = userDetailRepository;
        this.tagCategoryRepository = tagCategoryRepository;
    }

    // 클럽 생성
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
        System.out.println("club: " + requestDto);
        
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

    // 클럽 상세 조회
    public ClubDetailResponseDTO getClubDetail(Long clubId) {
        // 클럽 존재 여부 확인
        ClubEntity club = clubRepository.findById(clubId)
                .orElseThrow(() -> new IllegalArgumentException("클럽이 존재하지 않습니다."));
        
        // 클럽에 가입한 회원 목록 조회
        List<ClubMemberEntity> members = clubMemberRepository.findByClub(club);
        int currentScale = members.size();
        
        // 각 회원에 대해 userId와 닉네임(UserDetailEntity)을 조회하여 DTO 매핑
        List<ClubMemberDTO> memberDtos = members.stream().map(member -> {
            Long userId = member.getUser().getUserId();
            String nickname = "";
            UserDetailEntity userDetail = userDetailRepository.findById(userId).orElse(null);
            if (userDetail != null) {
                nickname = userDetail.getUserNickname();
            }
            return ClubMemberDTO.builder()
                    .userId(userId)
                    .userNickname(nickname)
                    .build();
        }).collect(Collectors.toList());
        
        // 응답 DTO 구성
        return ClubDetailResponseDTO.builder()
                .clubId(club.getClubId())
                .clubProfileImageId(club.getClubProfileImageId())
                .clubName(club.getClubName())
                .clubLeaderId(club.getClubLeader().getUserId())
                .clubDescription(club.getClubDescription())
                .createdAt(club.getCreatedAt())
                .maxUser(club.getMaxUser())
                .currentScale(currentScale)
                .users(memberDtos)
                .build();
    }

    // 클럽 리스트 조회
    public Page<ClubListItemDTO> getClubList(int page, int size) {
        PageRequest pageable = PageRequest.of(page, size);
        Page<ClubEntity> clubPage = clubRepository.findAll(pageable);
        
        // 각 ClubEntity를 ClubListItemDto로 매핑
        Page<ClubListItemDTO> dtoPage = clubPage.map(club -> {
            // currentScale: 해당 클럽의 가입 인원 수
            int currentScale = clubMemberRepository.countByClub(club).intValue();
            
            // tags: ClubEntity 내 tags( Set&lt;LightningTagCategoryEntity&gt; )에서 tagId를 추출
            List<Long> tagIds = club.getTags().stream()
                    .map(tag -> tag.getTagId())  // LightningTagCategoryEntity 에 tagId 필드가 있다고 가정
                    .collect(Collectors.toList());
            
            return ClubListItemDTO.builder()
                    .clubId(club.getClubId())
                    .clubProfileImageId(club.getClubProfileImageId())
                    .clubName(club.getClubName())
                    .clubLeaderId(club.getClubLeader().getUserId())
                    .clubShortDescription(club.getClubShortDescription())
                    .currentScale(currentScale)
                    .tags(tagIds)
                    .build();
        });
        return dtoPage;
    }

    // 클럽 정보 수정
    public void updateClub(Long clubId, ClubUpdateRequestDTO updateDto, String adminEmail) {
        // 1. 관리자 권한 확인
        UserEntity adminUser = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new IllegalArgumentException("관리자 계정이 존재하지 않습니다."));
        if (!adminUser.getRole().getRoleName().equalsIgnoreCase("ADMIN")) {
            throw new IllegalArgumentException("관리자 권한이 필요합니다.");
        }
        
        // 2. 클럽 존재 여부 확인
        ClubEntity club = clubRepository.findById(clubId)
                .orElseThrow(() -> new IllegalArgumentException("클럽이 존재하지 않습니다."));
        
        // 3. 클럽명 중복 체크 (수정하려는 클럽명이 기존과 다르고, 이미 존재하는 경우)
        if (updateDto.getClubName() != null && !updateDto.getClubName().equals(club.getClubName())) {
            Optional<ClubEntity> clubWithName = clubRepository.findByClubName(updateDto.getClubName());
            if (clubWithName.isPresent()) {
                throw new IllegalArgumentException("이미 존재하는 클럽명입니다.");
            }
            club.setClubName(updateDto.getClubName());
        }
        
        // 4. 나머지 필드 업데이트
        if (updateDto.getClubProfileImage() != null) {
            club.setClubProfileImageId(updateDto.getClubProfileImage());
        }
        if (updateDto.getClubShortDescription() != null) {
            club.setClubShortDescription(updateDto.getClubShortDescription());
        }
        if (updateDto.getClubDescription() != null) {
            club.setClubDescription(updateDto.getClubDescription());
        }
        if (updateDto.getMaxUser() != null) {
            club.setMaxUser(updateDto.getMaxUser());
        }
        
        // 5. 태그 업데이트: 요청된 태그 ID들을 이용하여 태그 엔티티 Set 구성
        if (updateDto.getTags() != null) {
            Set<LightningTagCategoryEntity> tagSet = new HashSet<>();
            updateDto.getTags().forEach(tagId -> {
                LightningTagCategoryEntity tagEntity = tagCategoryRepository.findById(tagId)
                        .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 태그 ID: " + tagId));
                tagSet.add(tagEntity);
            });
            club.setTags(tagSet);
        }
        
        // 6. 업데이트된 클럽 저장
        clubRepository.save(club);
    }

    // 클럽 소개글 수정
    public ClubInfoUpdateResponseDTO updateClubInfo(Long clubId, ClubInfoUpdateRequestDTO requestDto, String adminEmail) {
        // 1. 관리자 권한 확인
        UserEntity adminUser = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new IllegalArgumentException("관리자 계정이 존재하지 않습니다."));
        if (!adminUser.getRole().getRoleName().equalsIgnoreCase("ADMIN")) {
            throw new IllegalArgumentException("관리자 권한이 필요합니다.");
        }

        // 2. 소개글 유효성 검사
        String description = requestDto.getClubDescription();
        if (description == null || description.trim().isEmpty()) {
            throw new IllegalArgumentException("소개글이 비어있습니다.");
        }
        int maxAllowedLength = 1000; // 허용 최대 길이 (예시)
        if (description.length() > maxAllowedLength) {
            throw new IllegalArgumentException("클럽 소개글이 허용된 길이를 초과했습니다.");
        }

        // 3. 클럽 존재 여부 확인
        ClubEntity club = clubRepository.findById(clubId)
                .orElseThrow(() -> new IllegalArgumentException("클럽이 존재하지 않습니다."));

        // 4. 클럽 소개글 업데이트
        club.setClubDescription(description);
        clubRepository.save(club);

        // 5. 결과 응답 DTO 구성 (관리자 userId 포함)
        return ClubInfoUpdateResponseDTO.builder()
                .clubId(club.getClubId())
                .clubDescription(club.getClubDescription())
                .userId(adminUser.getUserId())
                .message("소개글 수정이 완료되었습니다.")
                .build();
    }
}
