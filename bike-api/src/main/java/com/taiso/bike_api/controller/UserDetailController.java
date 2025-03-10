package com.taiso.bike_api.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.taiso.bike_api.dto.UserDetailGetResponseDTO;
import com.taiso.bike_api.dto.UserDetailPatchRequestDTO;
import com.taiso.bike_api.dto.UserDetailPostRequestDTO;
import com.taiso.bike_api.service.UserDetailService2;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;



@RestController
@RequestMapping("/api/users")
@Slf4j
@Tag(name = "회원 정보 컨트롤러", description = "회원정보 디테일 관련 API")
public class UserDetailController {

    @Autowired
    private UserDetailService2 userDetailService2;

    @Operation(summary = "내 회원 디테일 등록", description = "내 회원 디테일 등록 API")
    @PostMapping("/me/details")
    public ResponseEntity<Void> postUserDetail(
        @RequestBody UserDetailPostRequestDTO requestDTO
        , @AuthenticationPrincipal String userEmail) {
        userDetailService2.saveUserDetail(requestDTO, userEmail);
        return ResponseEntity.status(HttpStatus.CREATED).body(null);
    }

    @Operation(summary = "내 회원 디테일 수정 화면 조회", description = "내 회원 디테일 수정 화면 API")
    @GetMapping("/me/details")
    public ResponseEntity<UserDetailGetResponseDTO> getUserDetail(@AuthenticationPrincipal String userEmail) {
        return ResponseEntity.status(HttpStatus.OK).body(userDetailService2.getUserDetail(userEmail));
    }

    @Operation(summary = "내 회원 디테일 수정", description = "내 회원 디테일 수정 API")
    @PatchMapping("/me/detail")
    public ResponseEntity<Void> patchUserDetail(@AuthenticationPrincipal String userEmail,
            @RequestBody UserDetailPatchRequestDTO requestDTO) {
        log.info("{}", requestDTO);
        userDetailService2.patchUserDetail(userEmail, requestDTO);
        return ResponseEntity.status(HttpStatus.OK).body(null);
    }

    @Operation(summary = "내 회원 디테일 프로필 이미지 조회", description = "내 회원 디테일 프로필 이미지 조회 API")
    @GetMapping("/me/details/profileImg")
    public ResponseEntity<String> getUserDetailProfileImg(Authentication authentication) {
        return ResponseEntity.status(HttpStatus.OK).body(userDetailService2.getProfileImg(authentication.getName()));
    }
    
}
