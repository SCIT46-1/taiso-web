package com.taiso.bike_api.service;

import java.util.Arrays;
import java.util.HashSet;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.taiso.bike_api.domain.BookmarkEntity.BookmarkType;
import com.taiso.bike_api.domain.UserDetailEntity;
import com.taiso.bike_api.domain.UserEntity;
import com.taiso.bike_api.domain.UserTagCategoryEntity;
import com.taiso.bike_api.dto.UserDetailRequestDTO;
import com.taiso.bike_api.dto.UserDetailResponseDTO;
import com.taiso.bike_api.exception.InvalidFileExtensionException;
import com.taiso.bike_api.repository.BookmarkRepository;
import com.taiso.bike_api.repository.ClubMemberRepository;
import com.taiso.bike_api.repository.LightningUserRepository;
import com.taiso.bike_api.repository.RouteRepository;
import com.taiso.bike_api.repository.UserDetailRepository;
import com.taiso.bike_api.repository.UserRepository;
import com.taiso.bike_api.repository.UserStravaDataRepository;
import com.taiso.bike_api.repository.UserTagCategoryRepository;

import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class UserDetailService {

    @Autowired
    S3Service s3Service;

    @Autowired
    private UserDetailRepository userDetailRepository;

    @Autowired
    private LightningUserRepository lightningUserRepository;

    @Autowired
    private ClubMemberRepository clubMemberRepository;

    @Autowired
    private RouteRepository routeRepository; 

    @Autowired
    private BookmarkRepository bookmarkRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserStravaDataRepository userStravaDataRepository;

    @Autowired
    private UserTagCategoryRepository userTagCategoryRepository;
@Transactional
public void updateUserDetail(UserDetailRequestDTO userDetailRequestDTO,
                             MultipartFile profileImg,
                             MultipartFile backgroundImg) {
    // 1. DTO 및 userId 유효성 체크
    if (userDetailRequestDTO == null) {
        throw new IllegalArgumentException("UserDetailRequestDTO가 null입니다.");
    }
    if (userDetailRequestDTO.getUserId() <= 0) {
        throw new IllegalArgumentException("올바르지 않은 userId: " + userDetailRequestDTO.getUserId());
    }
    log.info("저장 전 DTO: {}", userDetailRequestDTO);

    // 2. 이미지 처리: 프로필/배경 이미지 파일이 존재하면 S3 업로드 후 DTO 업데이트
    if (profileImg != null && !profileImg.isEmpty()) {
        String originalFilename = profileImg.getOriginalFilename();
        if (originalFilename == null ||
            (!originalFilename.toLowerCase().endsWith(".jpg") &&
             !originalFilename.toLowerCase().endsWith(".png") &&
             !originalFilename.toLowerCase().endsWith(".jpeg"))) {
            throw new InvalidFileExtensionException("지원하지 않는 파일 타입");
        }
        String profileImgId = s3Service.uploadFile(profileImg, userDetailRequestDTO.getUserId());
        userDetailRequestDTO.setProfileImg(profileImgId);
    } else {
        log.info("프로필 이미지는 null이거나 빈 파일이므로 기존 값을 사용합니다.");
    }

    if (backgroundImg != null && !backgroundImg.isEmpty()) {
        String originalFilename = backgroundImg.getOriginalFilename();
        if (originalFilename == null ||
            (!originalFilename.toLowerCase().endsWith(".jpg") &&
             !originalFilename.toLowerCase().endsWith(".png") &&
             !originalFilename.toLowerCase().endsWith(".jpeg"))) {
            throw new InvalidFileExtensionException("지원하지 않는 파일 타입");
        }
        String backgroundImgId = s3Service.uploadFile(backgroundImg, userDetailRequestDTO.getUserId());
        userDetailRequestDTO.setBackgroundImg(backgroundImgId);
    } else {
        log.info("배경 이미지는 null이거나 빈 파일이므로 기존 값을 사용합니다.");
    }

    log.info("저장 직전 DTO: {}", userDetailRequestDTO);

    // 3. 기존 사용자 엔티티 조회
    Optional<UserDetailEntity> optionalEntity = userDetailRepository.findById(userDetailRequestDTO.getUserId());
    if (!optionalEntity.isPresent()) {
        throw new NoSuchElementException("존재하지 않는 사용자입니다.");
    }
    UserDetailEntity entity = optionalEntity.get();

    // 4. 개별 필드 업데이트: DTO 값이 있으면 변경, 없으면 기존 값 유지
    entity.setUserNickname(userDetailRequestDTO.getUserNickname() != null
            ? userDetailRequestDTO.getUserNickname() : entity.getUserNickname());
    entity.setBio(userDetailRequestDTO.getBio() != null
            ? userDetailRequestDTO.getBio() : entity.getBio());

    // Gender 업데이트
    if (userDetailRequestDTO.getGender() != null) {
        try {
            entity.setGender(UserDetailEntity.Gender.valueOf(userDetailRequestDTO.getGender()));
        } catch (IllegalArgumentException e) {
            // 가능한 모든 값을 에러 메시지에 포함
            String validValues = String.join(", ", 
                Arrays.stream(UserDetailEntity.Gender.values())
                    .map(Enum::name)
                    .collect(Collectors.toList()));
                    
            throw new IllegalArgumentException("올바르지 않은 성별 값: " + userDetailRequestDTO.getGender() + 
                ". 허용된 값: " + validValues);
        }
    }

    // Level 업데이트
    if (userDetailRequestDTO.getLevel() != null) {
        try {
            entity.setLevel(UserDetailEntity.Level.valueOf(userDetailRequestDTO.getLevel()));
        } catch (IllegalArgumentException e) {
            // 가능한 모든 값을 에러 메시지에 포함
            String validValues = String.join(", ", 
                Arrays.stream(UserDetailEntity.Level.values())
                    .map(Enum::name)
                    .collect(Collectors.toList()));
                    
            throw new IllegalArgumentException("올바르지 않은 레벨 값: " + userDetailRequestDTO.getLevel() + 
                ". 허용된 값: " + validValues);
        }
    }

    // 5. 태그 업데이트 처리
    // 사용자는 미리 정의된 태그 목록에서 선택하므로, 신규 엔티티 생성 없이
    // DTO에 포함된 태그 이름으로 기존 엔티티를 조회하여 할당함
    if (userDetailRequestDTO.getTags() != null) {
        Set<UserTagCategoryEntity> selectedTags = new HashSet<>();
        for (String tagName : userDetailRequestDTO.getTags()) {
            Optional<UserTagCategoryEntity> tagOpt = userTagCategoryRepository.findByName(tagName);
            if (tagOpt.isPresent()) {
                selectedTags.add(tagOpt.get());
            } else {
                throw new IllegalArgumentException("유효하지 않은 태그입니다: " + tagName);
            }
        }
        entity.setTags(selectedTags);
    }

    // 6. 이미지 필드 업데이트: DTO에 값이 있으면 업데이트, 없으면 기존 값 유지
    entity.setUserProfileImg(userDetailRequestDTO.getProfileImg() != null
            ? userDetailRequestDTO.getProfileImg() : entity.getUserProfileImg());
    entity.setUserBackgroundImg(userDetailRequestDTO.getBackgroundImg() != null
            ? userDetailRequestDTO.getBackgroundImg() : entity.getUserBackgroundImg());
}


    @Transactional
    public UserDetailResponseDTO getUserDetailById (Long userId, String userEmail) {

        if (userId == null || userId <= 0) {
            throw new IllegalArgumentException(userId + " 값은 올바르지 않음");
        }

        //userDetailId로 해당 값 찾기
        Optional<UserDetailEntity> temp = userDetailRepository.findById(userId);
        // 데이터가 존재하지 않으면 예외 던지기
        if(!temp.isPresent()) {
            throw new NoSuchElementException("존재하지 않는 데이터");
        }
        UserDetailEntity userDetail = temp.get();

        //이메일로 유저 찾기
        Optional<UserEntity> tempUser = userRepository.findByEmail(userEmail);
        if(!tempUser.isPresent()) {
            throw new NoSuchElementException("존재하지 않는 데이터");
        }
        UserEntity user = tempUser.get();


        Integer userLightningsCount = lightningUserRepository.countByUser_UserId(userId);

        Integer userClubsCount = clubMemberRepository.countByUser_UserId(userId);

        Integer userRegisteredRoutesCount = routeRepository.countByUserId(userId);

        boolean bookmarked = bookmarkRepository.existsByUser_UserIdAndTargetIdAndTargetType(user.getUserId(), userId,
                BookmarkType.USER);

        boolean isStravaConnected = userRepository.existsByUserIdAndStravaIdIsNull(userId);

        Integer userStravaDataCount = userStravaDataRepository.countByUser(user);

        Integer userStravaKm = userStravaDataRepository.findByUser(user)
                .stream()
                .mapToInt(data -> data.getDistance() != null ? data.getDistance().intValue() : 0)
                .sum();

        Integer userStravaElevation = userStravaDataRepository.findByUser(user)
                .stream()
                .mapToInt(data -> data.getElevation() != null ? data.getElevation().intValue() : 0)
                .sum();


        UserDetailResponseDTO userDetailResponseDTO = null;
            //Entity -> DTO 로 builder
            userDetailResponseDTO = UserDetailResponseDTO.builder()
                    .userId(userDetail.getUserId())
                    .userNickname(userDetail.getUserNickname())
                    .bio(userDetail.getBio())
                    .profileImg(userDetail.getUserProfileImg())
                    .backgroundImg(userDetail.getUserBackgroundImg())
                    .level(userDetail.getLevel() != null ? userDetail.getLevel().name() : null)
                    .gender(userDetail.getGender() != null ? userDetail.getGender().name() : null)
                    .tags(userDetail.getTags().stream().map(tag -> tag.getName()).collect(Collectors.toSet()))
                    .userLightningsCount(userLightningsCount)
                    .userClubsCount(userClubsCount)
                    .userRegisteredRoutesCount(userRegisteredRoutesCount)
                    .bookmarked(bookmarked)
                    .isStravaConnected(!isStravaConnected)
                    .userStravaDataCount(userStravaDataCount)
                    .userStravaKm(userStravaKm)
                    .userStravaElevation(userStravaElevation)
                    .build();

        return userDetailResponseDTO;
    }

}
