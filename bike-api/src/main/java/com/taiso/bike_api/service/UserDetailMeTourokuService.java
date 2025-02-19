package com.taiso.bike_api.service;

import com.taiso.bike_api.domain.UserDetailEntity;
import com.taiso.bike_api.domain.UserDetailEntity.Gender;
import com.taiso.bike_api.domain.UserEntity;
import com.taiso.bike_api.dto.UserDetailRequestDTO;
import com.taiso.bike_api.repository.UserDetailRepository;
import com.taiso.bike_api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserDetailMeTourokuService {

    private final UserDetailRepository userDetailRepository;
    private final UserRepository userRepository;

    @Autowired
    public UserDetailMeTourokuService(UserDetailRepository userDetailRepository,
                             UserRepository userRepository) {
        this.userDetailRepository = userDetailRepository;
        this.userRepository = userRepository;
    }

    public void registerUserDetails(UserDetailRequestDTO requestDto, String email) {
        // 이메일로 사용자 엔티티 조회
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Long userId = user.getUserId(); // UserEntity의 PK 필드

        // DTO의 데이터를 UserDetailEntity로 매핑
        UserDetailEntity userDetail = new UserDetailEntity();
        userDetail.setUserId(userId);
        userDetail.setUser(user);
        userDetail.setUserNickname(requestDto.getUserNickname());

        // 전달받은 gender 문자열을 Enum으로 변환 (예: "남자", "여자", "그외")
        try {
            userDetail.setGender(Gender.valueOf(requestDto.getGender()));
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("입력한 gender 값이 올바르지 않습니다.");
        }

        userDetail.setAge(requestDto.getAge());
        userDetail.setHeight(requestDto.getHeight());
        userDetail.setWeight(requestDto.getWeight());
        userDetail.setFTP(requestDto.getFTP());
        userDetail.setPhoneNumber(requestDto.getPhoneNumber());
        userDetail.setBirthDate(requestDto.getBirthDate());

        // 추가 필드 (예: bio, profileImg, backgroundImg 등)는 필요 시 설정

        // UserDetailEntity를 데이터베이스에 저장
        userDetailRepository.save(userDetail);
    }
}
