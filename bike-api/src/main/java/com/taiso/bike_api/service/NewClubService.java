package com.taiso.bike_api.service;

import com.taiso.bike_api.domain.ClubEntity;
import com.taiso.bike_api.domain.LightningTagCategoryEntity;
import com.taiso.bike_api.domain.UserEntity;
import com.taiso.bike_api.dto.ClubCreateRequestDTO;
import com.taiso.bike_api.exception.ClubAlreadyExistsException;
import com.taiso.bike_api.exception.InvalidFileExtensionException;
import com.taiso.bike_api.exception.TagsNotFoundException;
import com.taiso.bike_api.exception.UserNotFoundException;
import com.taiso.bike_api.repository.ClubRepository;
import com.taiso.bike_api.repository.LightningTagCategoryRepository;
import com.taiso.bike_api.repository.UserRepository;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
public class NewClubService {

    @Autowired
    private ClubRepository clubRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LightningTagCategoryRepository lightningTagCategoryRepository;

    @Autowired
    S3Service s3Service;

    // 클럽 생성
    public void createLightning(ClubCreateRequestDTO requestDTO, Authentication authentication, MultipartFile clubProfileImage) {

        // 클럽명 중복 체크
        Optional<ClubEntity> existingClub = clubRepository.findByClubName(requestDTO.getClubName());
        if (existingClub.isPresent()) {
            throw new ClubAlreadyExistsException(requestDTO.getClubName() +"은(는) 이미 존재하는 클럽명입니다.");
        }

        // 현재 사용자 조회
        UserEntity clubCreator = userRepository.findByEmail(authentication.getName())
                // 사용자 찾을 수 없음 -> 404
                .orElseThrow(() -> new UserNotFoundException("현재 리뷰 입력 사용자를 찾을 수 없습니다."));

        // 태그 담기
        Set<LightningTagCategoryEntity> tags = requestDTO.getTags().stream()
                .map(tagName -> lightningTagCategoryRepository.findByName(tagName)
                        .orElseGet(() -> lightningTagCategoryRepository.save(
                                LightningTagCategoryEntity.builder().name(tagName).build())))
                .collect(Collectors.toSet());

        // 이미지 null 체크
        if (clubProfileImage != null && !clubProfileImage.isEmpty()) {

            // 들어온 파일 존재 여부 및 확장자 확인
            String originalFilename = clubProfileImage.getOriginalFilename();
            if (originalFilename == null ||
                    (!originalFilename.toLowerCase().endsWith(".jpg") && !originalFilename.toLowerCase().endsWith(".png") && !originalFilename.toLowerCase().endsWith(".jpeg"))) {
                throw new InvalidFileExtensionException("지원하지 않는 파일 타입");
            }

            // null&확장자 확인되면 S3에 업로드 후 DB에 저장할 Id 생성
            String clubProfileImageId = s3Service.uploadFile(clubProfileImage, clubCreator.getUserId());
            // 프로필 이미지 Id 업데이트
            requestDTO.setClubProfileImageId(clubProfileImageId);
        } else {
            log.info("프로필 이미지는 null이거나 빈 파일이므로 업데이트하지 않고 기존 DTO의 값 사용");
        }

        // 최종 빌드
        ClubEntity club = ClubEntity.builder()
                .clubProfileImageId(requestDTO.getClubProfileImageId())
                .clubName(requestDTO.getClubName())
                .clubShortDescription(requestDTO.getClubShortDescription())
                .clubDescription(requestDTO.getClubDescription())
                .maxUser(requestDTO.getMaxUser())
                .clubLeader(clubCreator)
                .tags(tags)
                .build();

        clubRepository.save(club);
    }
}
