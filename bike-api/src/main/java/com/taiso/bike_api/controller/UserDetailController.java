package com.taiso.bike_api.controller;

import com.taiso.bike_api.dto.UserDetailRequestDTO;
import com.taiso.bike_api.dto.UserDetailResponseDTO;
import com.taiso.bike_api.dto.UserDetailUpdateDTO;
import com.taiso.bike_api.service.*;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;

@RestController
@RequestMapping("/users/me")
public class UserDetailController {

    @Autowired
    UserDetailMeTourokuService userDetailMeTourokuService;
    UserDetailMeShowService userDetailMeShowService;
    UserDetailMeUpdateService userDetailMeUpdateService;

    // 내 디테일 정보 등록 (UserDetailMeTourokuService))
    @PostMapping("/details")
    public ResponseEntity<?> registerUserDetails(
            @RequestBody @Valid UserDetailRequestDTO requestDto,
            Authentication authentication) {

        // Authentication 객체에서 사용자 이메일(식별자) 추출
        String email = authentication.getName();

        try {
            userDetailMeTourokuService.registerUserDetails(requestDto, email);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("message", e.getMessage()));
        }

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Collections.singletonMap("message", "내 디테일 정보가 등록되었습니다."));
    }

    // 내 정보 보기 (UserDetailMeShowService)
    @GetMapping("/details")
    public ResponseEntity<?> getUserDetails(Authentication authentication) {
        // Authentication 객체에서 사용자 이메일(식별자) 추출
        String email = authentication.getName();

        UserDetailResponseDTO responseDto;
        try {
            responseDto = userDetailMeShowService.getUserDetails(email);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("message", e.getMessage()));
        }

        // spec에 따른 응답 코드 (201 Created)와 함께 조회 결과 반환
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(responseDto);
    }

    // 내 정보 수정 (UserDetailUpdateService)
    @PatchMapping("/details")
    public ResponseEntity<?> updateUserDetails(
            @RequestBody @Valid UserDetailUpdateDTO updateDto,
            Authentication authentication) {

        // Authentication 객체에서 사용자 식별자(예: 이메일)를 추출
        String email = authentication.getName();

        try {
            userDetailMeUpdateService.updateUserDetails(updateDto, email);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("message", e.getMessage()));
        }

        return ResponseEntity.status(HttpStatus.OK)
                .body(Collections.singletonMap("message", "내 디테일 정보가 수정되었습니다."));
    }
}