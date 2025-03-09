package com.taiso.bike_api.service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import com.taiso.bike_api.domain.ClubEntity;
import com.taiso.bike_api.domain.LightningTagCategoryEntity;
import com.taiso.bike_api.domain.UserEntity;
import com.taiso.bike_api.dto.ClubDescriptionUpdateRequestDTO;
import com.taiso.bike_api.dto.ClubDescriptionUpdateResponseDTO;
import com.taiso.bike_api.dto.ClubDetailGetResponseDTO;
import com.taiso.bike_api.dto.ClubDetailsUpdateRequestDTO;
import com.taiso.bike_api.dto.ClubDetailsUpdateResponseDTO;
import com.taiso.bike_api.dto.ClubsGetResponseDTO;
import com.taiso.bike_api.exception.ClubNotFoundException;
import com.taiso.bike_api.exception.ClubUpdateNoPermissionException;
import com.taiso.bike_api.exception.UserNotFoundException;
import com.taiso.bike_api.repository.ClubRepository;
import com.taiso.bike_api.repository.LightningTagCategoryRepository;
import com.taiso.bike_api.repository.UserRepository;

import jakarta.transaction.Transactional;

@Service
public class ClubService {

    @Autowired
    private ClubRepository clubRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LightningTagCategoryRepository lightningTagCategoryRepository;
    
    public ClubDetailGetResponseDTO getClubDetail(Long clubId) {

        // 클럽 존재여부 확인
        ClubEntity club = clubRepository.findById(clubId)
            .orElseThrow(() -> new ClubNotFoundException("클럽이 존재하지 않습니다."));

        // responseDTO 빌드
        return ClubDetailGetResponseDTO.toDTO(club);
        
    }

    public List<ClubsGetResponseDTO> getClubs() {
        // 클럽 리스트 조회
        List<ClubEntity> clubs = clubRepository.findAll();

        // responseDTO 리스트 빌드
        return clubs.stream().map(ClubsGetResponseDTO::toDTO).toList();
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
    public ClubDetailsUpdateResponseDTO updateClubDetails(Long clubId, ClubDetailsUpdateRequestDTO requestDTO, Authentication authentication) {

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
            (requestDTO.getClubProfileImageId() == club.getClubProfileImageId() ||
            requestDTO.getClubProfileImageId().equals(club.getClubProfileImageId())) &&
            requestDTO.getClubName().equals(club.getClubName()) &&
            requestDTO.getClubShortDescription().equals(club.getClubShortDescription()) &&
            requestDTO.getMaxUser().equals(club.getMaxUser()) &&
            requestDTO.getTags().equals(club.getTags().stream().map(tag -> tag.getName()).collect(Collectors.toSet()))) {
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

}
