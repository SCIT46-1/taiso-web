package com.taiso.bike_api.service;

import java.util.NoSuchElementException;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.taiso.bike_api.domain.UserDetailEntity;
import com.taiso.bike_api.dto.UserDetailRequestDTO;
import com.taiso.bike_api.dto.UserDetailResponseDTO;
import com.taiso.bike_api.exception.InvalidFileExtensionException;
import com.taiso.bike_api.repository.UserDetailRepository;

import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class UserDetailService {

    @Autowired
    S3Service s3Service;

    @Autowired
    private UserDetailRepository userDetailRepository;

    //이미지를 S3에 저장하기 + 정보 업데이트
    @Transactional
    public void updateUserDetail (UserDetailRequestDTO userDetailRequestDTO,
                                  MultipartFile profileImg,
                                  MultipartFile backgroundImg) {

        // 입력값 오류 처리
        if (userDetailRequestDTO == null || userDetailRequestDTO.getUserId() <= 0) {
            throw new IllegalArgumentException(userDetailRequestDTO.getUserId() + " 값은 올바르지 않음");
        }

        log.info("저장전 : {}", userDetailRequestDTO.toString());
        log.info("profileImg : {}",profileImg.getOriginalFilename());
        log.info("backgroundImg : {}",backgroundImg.getOriginalFilename());

        // profileImg null 체크
        if (profileImg != null && !profileImg.isEmpty()) {

            // 들어온 파일 존재 여부 및 확장자 확인
            String originalFilename = profileImg.getOriginalFilename();
            if (originalFilename == null ||
                    (!originalFilename.toLowerCase().endsWith(".jpg") && !originalFilename.toLowerCase().endsWith(".png") && !originalFilename.toLowerCase().endsWith(".jpeg"))) {
                throw new InvalidFileExtensionException("지원하지 않는 파일 타입");
            }

            // null&확장자 확인되면 S3에 업로드 후 DB에 저장할 Id 생성
            String profileImgId = s3Service.uploadFile(profileImg, userDetailRequestDTO.getUserId());
            // 프로필 이미지 Id 업데이트
            userDetailRequestDTO.setProfileImg(profileImgId);
        } else {
            log.info("프로필 이미지는 null이거나 빈 파일이므로 업데이트하지 않고 기존 DTO의 값 사용");
        }

        // backgroundImg null 체크
        if (backgroundImg != null && !backgroundImg.isEmpty()) {

            // 들어온 파일 존재 여부 및 확장자 확인
            String originalFilename = backgroundImg.getOriginalFilename();
            if (originalFilename == null ||
                    (!originalFilename.toLowerCase().endsWith(".jpg") && !originalFilename.toLowerCase().endsWith(".png") && !originalFilename.toLowerCase().endsWith(".jpeg"))) {
                throw new InvalidFileExtensionException("지원하지 않는 파일 타입");
            }

            // null&확장자 확인되면 S3에 업로드 후 DB에 저장할 Id 생성
            String backgroundImgId = s3Service.uploadFile(backgroundImg, userDetailRequestDTO.getUserId());
            // 배경 이미지 Id 업데이트
            userDetailRequestDTO.setBackgroundImg(backgroundImgId);
        } else {
            log.info("배경 이미지는 null이거나 빈 파일이므로 업데이트하지 않고 기존 DTO의 값 사용");
        }

        log.info("저장 직전 : {}",userDetailRequestDTO.toString());

        //userId로 업데이트할 데이터 DB에서 찾아오기
        Optional<UserDetailEntity> temp = userDetailRepository.findById(userDetailRequestDTO.getUserId());
        //존재하는지 체크
        if(!temp.isPresent()) {
            throw new NoSuchElementException("존재하지 않는 사용자");
        }
        UserDetailEntity entity = temp.get();

        // 업데이트
        entity.setUserNickname(userDetailRequestDTO.getUserNickname());
        entity.setUserProfileImg(userDetailRequestDTO.getProfileImg());
        entity.setUserBackgroundImg(userDetailRequestDTO.getBackgroundImg());

        //종료하기
        s3Service.close();
    }


    //S3에서 이미지를 불러오기 + 정보 불러오기
    @Transactional
    public UserDetailResponseDTO getUserDetailById (Long userId) {

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

        UserDetailResponseDTO userDetailResponseDTO = null;
            //Entity -> DTO 로 builder
            userDetailResponseDTO = UserDetailResponseDTO.builder()
                    .userId(userDetail.getUserId())
                    .userNickname(userDetail.getUserNickname())
                    .vio(userDetail.getVio())
                    .profileImg(userDetail.getUserProfileImg())
                    .backgroundImg(userDetail.getUserBackgroundImg())
                    .build();

        //종료하기
        s3Service.close();

        return userDetailResponseDTO;
    }

}
