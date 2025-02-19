package com.taiso.bike_api.service;

import com.taiso.bike_api.domain.UserDetailEntity;
import com.taiso.bike_api.domain.UserDetailEntity.Gender;
import com.taiso.bike_api.domain.UserEntity;
import com.taiso.bike_api.dto.UserDetailUpdateDTO;
import com.taiso.bike_api.repository.UserDetailRepository;
import com.taiso.bike_api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserDetailMeUpdateService {

    private final UserDetailRepository userDetailRepository;
    private final UserRepository userRepository;

    @Autowired
    public UserDetailMeUpdateService(UserDetailRepository userDetailRepository,
                             UserRepository userRepository) {
        this.userDetailRepository = userDetailRepository;
        this.userRepository = userRepository;
    }

    public void updateUserDetails(UserDetailUpdateDTO updateDto, String email) {
        // 이메일로 사용자 조회
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Long userId = user.getUserId();

        // 사용자 ID를 통해 상세 정보 조회
        UserDetailEntity userDetail = userDetailRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User detail not found"));

        // DTO의 데이터를 Entity 필드에 업데이트
        userDetail.setFullName(updateDto.getFullName());

        try {
            userDetail.setGender(Gender.valueOf(updateDto.getGender()));
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("입력한 gender 값이 올바르지 않습니다.");
        }

        userDetail.setAge(updateDto.getAge());
        userDetail.setHeight(updateDto.getHeight());
        userDetail.setWeight(updateDto.getWeight());
        userDetail.setFTP(updateDto.getFTP());
        userDetail.setPhoneNumber(updateDto.getPhoneNumber());
        userDetail.setBirthDate(updateDto.getBirthDate());

        // 변경된 정보를 데이터베이스에 저장
        userDetailRepository.save(userDetail);
    }
}
