package com.taiso.bike_api.service;

import java.util.List;
import java.util.Set;
import java.util.concurrent.atomic.AtomicReference;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import com.taiso.bike_api.domain.BookmarkEntity.BookmarkType;
import com.taiso.bike_api.domain.ClubEntity;
import com.taiso.bike_api.domain.ClubMemberEntity.ParticipantStatus;
import com.taiso.bike_api.domain.LightningTagCategoryEntity;
import com.taiso.bike_api.domain.UserEntity;
import com.taiso.bike_api.dto.ClubDescriptionUpdateRequestDTO;
import com.taiso.bike_api.dto.ClubDescriptionUpdateResponseDTO;
import com.taiso.bike_api.dto.ClubDetailGetResponseDTO;
import com.taiso.bike_api.dto.ClubDetailsUpdateRequestDTO;
import com.taiso.bike_api.dto.ClubDetailsUpdateResponseDTO;
import com.taiso.bike_api.dto.ClubListResponseDTO;
import com.taiso.bike_api.dto.ClubsGetResponseDTO;
import com.taiso.bike_api.exception.ClubNotFoundException;
import com.taiso.bike_api.exception.ClubUpdateNoPermissionException;
import com.taiso.bike_api.exception.UserNotFoundException;
import com.taiso.bike_api.repository.BookmarkRepository;
import com.taiso.bike_api.repository.ClubRepository;
import com.taiso.bike_api.repository.LightningTagCategoryRepository;
import com.taiso.bike_api.repository.UserRepository;

import jakarta.persistence.criteria.Join;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class ClubService {

    @Autowired
    private ClubRepository clubRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LightningTagCategoryRepository lightningTagCategoryRepository;

    @Autowired
    private BookmarkRepository bookmarkRepository;
    
    public ClubDetailGetResponseDTO getClubDetail(Long clubId) {
        // 클럽 존재여부 확인
        ClubEntity club = clubRepository.findById(clubId)
            .orElseThrow(() -> new ClubNotFoundException("클럽이 존재하지 않습니다."));
        
        // responseDTO 빌드
        return ClubDetailGetResponseDTO.toDTO(club);
    }

    public ClubListResponseDTO getClubs(int page, int size, String tags, String sort, String userEmail) {
        // 정렬 기준 설정
        Sort sortObj = Sort.unsorted();
        if (!sort.isEmpty()) {
            sortObj = Sort.by(sort).ascending();
        }

        // 페이지 요청 생성
        Pageable pageable = PageRequest.of(page, size, sortObj);
        
        // 필터링 조건 생성
        AtomicReference<Specification<ClubEntity>> specRef = 
            new AtomicReference<>(Specification.where(null));
        
        // 태그 필터
        if (tags != null && !tags.isEmpty()) {
            String[] tagArray = tags.split(",");
            specRef.set(specRef.get().and((root, query, criteriaBuilder) -> {
                Join<ClubEntity, LightningTagCategoryEntity> tagJoin = root.join("tags");
                return tagJoin.get("name").in((Object[]) tagArray);
            }));
        }
        
        // 필터링된 데이터로 페이징 조회
        Page<ClubEntity> clubPage = clubRepository.findAll(specRef.get(), pageable);

        // 응답 DTO생성 - 빌더 패턴 사용
        List<ClubsGetResponseDTO> clubDTO = clubPage.getContent().stream()
                .map(club -> {
                    // 기본 DTO 생성
                    ClubsGetResponseDTO dto = ClubsGetResponseDTO.builder()
                            .clubId(club.getClubId())
                            .clubProfileImageId(club.getClubProfileImageId())
                            .clubName(club.getClubName())
                            .clubLeaderId(club.getClubLeader().getUserId())
                            .clubLeaderName(club.getClubLeader().getUserDetail().getUserNickname())
                            .clubLeaderProfileImageId(club.getClubLeader().getUserDetail().getUserProfileImg())
                            .clubShortDescription(club.getClubShortDescription())
                            .maxScale(club.getMaxUser())
                            .currentScale(club.getUsers().stream().filter(member -> member.getParticipantStatus() == ParticipantStatus.완료 || member.getParticipantStatus() == ParticipantStatus.승인).collect(Collectors.toList()).size())
                            .tags(club.getTags().stream().map(tag -> tag.getName()).collect(Collectors.toSet()))
                            .build();
                    
                    // 북마크 정보는 별도로 채워넣기
                    if (userEmail != null && !userEmail.isEmpty()) {
                        try {
                            UserEntity user = userRepository.findByEmail(userEmail).orElse(null);
                            if (user != null) {
                                // 별도 쿼리로 북마크 여부 확인
                                boolean isBookmarked = bookmarkRepository.existsByUser_UserIdAndTargetIdAndTargetType(
                                    user.getUserId(), 
                                    club.getClubId(),
                                    BookmarkType.CLUB
                                );
                                dto.setBookmarked(isBookmarked);
                            }
                        } catch (Exception e) {
                            // 오류 무시 - 사용자에게 표시할 데이터에 영향을 주지 않음
                            log.error("사용자 북마크 확인 중 오류: {}", e.getMessage());
                        }
                    }

                    return dto;
                })
                .collect(Collectors.toList());

        return ClubListResponseDTO.builder()
                .content(clubDTO)
                .pageNo(clubPage.getNumber() + 1)
                .pageSize(clubPage.getSize())
                .totalElements(clubPage.getTotalElements())
                .totalPages(clubPage.getTotalPages())
                .last(clubPage.isLast())
                .build();
    }

    @Transactional
    public ClubDescriptionUpdateResponseDTO updateClubDescription(Long clubId, ClubDescriptionUpdateRequestDTO requestDTO, Authentication authentication) {

        // 클럽 존재여부 확인
        ClubEntity club = clubRepository.findById(clubId)
            .orElseThrow(() -> new ClubNotFoundException("클럽이 존재하지 않습니다."));

        // 유저 존재여부 확인
        UserEntity user = userRepository.findByEmail(authentication.getName())
            .orElseThrow(() -> new UserNotFoundException("유저가 존재하지 않습니다."));

        // 클럽 수정 권한 확인
        if (!club.getClubLeader().getUserId().equals(user.getUserId())) {
            throw new ClubUpdateNoPermissionException("클럽 소유자만 수정할 수 있습니다.");
        }

        // 변경사항 존재여부 확인
        if (
            requestDTO.getNewDescription() == club.getClubDescription()) {
            return ClubDescriptionUpdateResponseDTO.toDTO("변경사항이 존재하지 않습니다.");
        }

        // 클럽 설명 수정
        club.setClubDescription(requestDTO.getNewDescription());

        return ClubDescriptionUpdateResponseDTO.toDTO("소개글이 변경되었습니다.");
    }

    @Transactional
    public ClubDetailsUpdateResponseDTO updateClubDetails(Long clubId, ClubDetailsUpdateRequestDTO requestDTO,
            Authentication authentication) {

        // 클럽 존재여부 확인
        ClubEntity club = clubRepository.findById(clubId)
                .orElseThrow(() -> new ClubNotFoundException("클럽이 존재하지 않습니다."));

        // 유저 존재여부 확인
        UserEntity user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new UserNotFoundException("유저가 존재하지 않습니다."));

        // 클럽 수정 권한 확인
        if (!club.getClubLeader().getUserId().equals(user.getUserId())) {
            throw new ClubUpdateNoPermissionException("클럽 소유자만 수정할 수 있습니다.");
        }

        // 변경사항 존재여부 확인
        if ((requestDTO.getClubProfileImageId() == club.getClubProfileImageId() ||
                requestDTO.getClubProfileImageId().equals(club.getClubProfileImageId())) &&
                requestDTO.getClubName().equals(club.getClubName()) &&
                requestDTO.getClubShortDescription().equals(club.getClubShortDescription()) &&
                requestDTO.getMaxUser().equals(club.getMaxUser()) &&
                requestDTO.getTags()
                        .equals(club.getTags().stream().map(tag -> tag.getName()).collect(Collectors.toSet()))) {
            return ClubDetailsUpdateResponseDTO.toDTO("변경사항이 존재하지 않습니다.");
        }

        // 태그 담기
        Set<LightningTagCategoryEntity> tags = requestDTO.getTags().stream()
                .map(tagName -> lightningTagCategoryRepository.findByName(tagName)
                        .orElseGet(() -> lightningTagCategoryRepository.save(
                                LightningTagCategoryEntity.builder().name(tagName).build())))
                .collect(Collectors.toSet());

        // 클럽 정보 수정
        club.setClubProfileImageId(requestDTO.getClubProfileImageId());
        club.setClubName(requestDTO.getClubName());
        club.setClubShortDescription(requestDTO.getClubShortDescription());
        club.setMaxUser(requestDTO.getMaxUser());
        club.setTags(tags);

        return ClubDetailsUpdateResponseDTO.toDTO("클럽정보가 변경되었습니다.");
    }
    

    // 내가 가입한 클럽 조회
    public ClubListResponseDTO getMyClub(Authentication authentication) {
        UserEntity user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new UserNotFoundException("유저가 존재하지 않습니다."));


        List<ClubEntity> clubs = clubRepository.findAllByUsers_User_UserIdAndUsers_ParticipantStatus(user.getUserId(), ParticipantStatus.승인);

        return ClubListResponseDTO.builder()
                .content(clubs.stream().map(club -> ClubsGetResponseDTO.builder()
                        .clubId(club.getClubId())
                        .clubProfileImageId(club.getClubProfileImageId())
                        .clubName(club.getClubName())
                        .clubLeaderId(club.getClubLeader().getUserId())
                        .clubLeaderName(club.getClubLeader().getUserDetail().getUserNickname())
                        .clubLeaderProfileImageId(club.getClubLeader().getUserDetail().getUserProfileImg())
                        .clubShortDescription(club.getClubShortDescription())
                        .maxScale(club.getMaxUser())
                        .currentScale(club.getUsers().stream().filter(member -> member.getParticipantStatus() == ParticipantStatus.완료 || member.getParticipantStatus() == ParticipantStatus.승인).collect(Collectors.toList()).size())
                        .tags(club.getTags().stream().map(tag -> tag.getName()).collect(Collectors.toSet()))
                        .build())
                        .collect(Collectors.toList()))
                .pageNo(1)
                .pageSize(clubs.size())
                .totalElements(clubs.size())
                .totalPages(1)
                .last(true)
                .build();
    }


}
