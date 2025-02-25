package com.taiso.bike_api.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.taiso.bike_api.domain.UserDetailEntity;
import com.taiso.bike_api.domain.UserEntity;
import com.taiso.bike_api.dto.UserDetailResponseDTO;
import com.taiso.bike_api.repository.UserDetailRepository;
import com.taiso.bike_api.repository.UserRepository;

@Service
public class UserDetailMeShowService {

    private final UserDetailRepository userDetailRepository;
    private final UserRepository userRepository;

    @Autowired
    public UserDetailMeShowService(UserDetailRepository userDetailRepository,
                             UserRepository userRepository) {
        this.userDetailRepository = userDetailRepository;
        this.userRepository = userRepository;
    }

    public UserDetailResponseDTO getUserDetails(String email) {
        // 이메일로 사용자 조회
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Long userId = user.getUserId();


        // 사용자 ID를 통해 상세 정보 조회 (UserDetailEntity의 @Id는 userId와 동일)
        UserDetailEntity userDetail = userDetailRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User detail not found"));


        // Entity의 필드를 DTO로 매핑 (gender는 Enum을 문자열로 변환)
        return UserDetailResponseDTO.builder()
                .userId(userDetail.getUserId())
                .userNickname(userDetail.getUserNickname())
                .vio(userDetail.getVio())
                .profileImg(userDetail.getUserProfileImg())
                        .backgroundImg(userDetail.getUserBackgroundImg())
                //널이면 빈문자열
                .level(userDetail.getLevel() == null ? "" : userDetail.getLevel().toString())
                .fullName(userDetail.getFullName())
                .gender(userDetail.getGender() != null ? userDetail.getGender().toString() : null)
                .age(userDetail.getAge())
                .height(userDetail.getHeight())
                .weight(userDetail.getWeight())
                .FTP(userDetail.getFTP())
                .phoneNumber(userDetail.getPhoneNumber())
                .birthDate(userDetail.getBirthDate())
                .build();
    }
}
