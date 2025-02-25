package com.taiso.bike_api.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.taiso.bike_api.domain.UserDetailEntity;
import com.taiso.bike_api.domain.UserEntity;
import com.taiso.bike_api.dto.UserDetailPostRequestDTO;
import com.taiso.bike_api.exception.UserNotFoundException;
import com.taiso.bike_api.repository.UserDetailRepository;
import com.taiso.bike_api.repository.UserRepository;

@Service
public class UserDetailService2 {

    @Autowired
    private UserDetailRepository userDetailRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    public void saveUserDetail(UserDetailPostRequestDTO requestDTO, String userEmail) {

        // 사용자 정보 가져오기
        UserEntity user = userRepository.findByEmail(userEmail).orElseThrow(() -> new UserNotFoundException("사용자 정보가 없습니다."));
        
        // UserDetailEntity 생성
        UserDetailEntity userDetail = UserDetailEntity.builder()
                .userId(user.getUserId())
                .user(user)
                .userNickname(requestDTO.getUserNickname())
                .fullName(requestDTO.getFullName())
                .phoneNumber(requestDTO.getPhoneNumber())
                .birthDate(requestDTO.getBirthDate())
                .activityTime(requestDTO.getActivityTime())
                .activityDay(requestDTO.getActivityDay())
                .activityLocation(requestDTO.getActivityLocation())
                .bikeType(requestDTO.getBikeType())
                .level(requestDTO.getLevel())
                .FTP(requestDTO.getFTP())
                .height(requestDTO.getHeight())
                .weight(requestDTO.getWeight())
                .build();

        // UserDetailEntity 저장
        userDetailRepository.save(userDetail);
    }

}
