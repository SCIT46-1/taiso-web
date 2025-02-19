package com.taiso.bike_api.controller;

import com.taiso.bike_api.dto.ApiResponseDto;
import com.taiso.bike_api.dto.UserDetailRequestDTO;
import com.taiso.bike_api.dto.UserDetailResponseDTO;
import com.taiso.bike_api.dto.UserDetailUpdateDTO;
import com.taiso.bike_api.security.JwtTokenProvider;
import com.taiso.bike_api.service.UserDetailService;
import com.taiso.bike_api.service.UserDetailMeTourokuService;
import com.taiso.bike_api.service.UserDetailMeUpdateService;
import com.taiso.bike_api.service.UserDetailMeShowService;
import jakarta.servlet.http.HttpServletRequest;
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

@RestController
@RequestMapping("/users/me")
public class UserDetailController {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserDetailService userDetailService;
    private final UserDetailMeTourokuService userDetailMeTourokuService;
    private final UserDetailMeShowService userDetailMeShowService;
    private final UserDetailMeUpdateService userDetailMeUpdateService;

    @Autowired
    public UserDetailController(JwtTokenProvider jwtTokenProvider,
                                UserDetailService userDetailService,
                                UserDetailMeTourokuService userDetailMeTourokuService,
                                UserDetailMeShowService userDetailMeShowService,
                                UserDetailMeUpdateService userDetailMeUpdateService
                                ) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.userDetailService = userDetailService;
        this.userDetailMeTourokuService = userDetailMeTourokuService;
        this.userDetailMeShowService = userDetailMeShowService;
        this.userDetailMeUpdateService = userDetailMeUpdateService;
    }

    // 내 디테일 정보 등록 (모범 인증)
    // @PostMapping("/details")
    // public ResponseEntity<ApiResponseDto> registerUserDetails(
    //     @RequestBody @Valid UserDetailRequestDTO requestDto, Authentication authentication) {
    //         // Authentication 객체에서 이메일(사용자 식별자) 추출
    //         String email = authentication.getName();
    //         try {
    //             userDetailMeTourokuService.registerUserDetails(requestDto, email);
    //         } catch (IllegalArgumentException e) {
    //             return ResponseEntity.status(HttpStatus.BAD_REQUEST)
    //             .body(new ApiResponseDto(e.getMessage()));
    //         }
    //         return ResponseEntity.status(HttpStatus.CREATED)
    //         .body(new ApiResponseDto("내 디테일 정보가 등록되었습니다."));
    // }

    // 내 디테일 정보 등록 (UserDetailMeTourokuService))
    @PostMapping("/details")
    public ResponseEntity<ApiResponseDto> registerUserDetails(
            @RequestBody @Valid UserDetailRequestDTO requestDto,
            HttpServletRequest request) {

        // JWT 토큰을 "Authorization" 헤더에서 추출
        String token = request.getHeader("Authorization");
        if (token == null || token.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponseDto("토큰이 존재하지 않습니다."));
        }

        // JWT 토큰 검증
        if (!jwtTokenProvider.validateToken(token)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ApiResponseDto("만료되거나 올바르지 않은 토큰 입니다."));
        }

        // 토큰에서 이메일(사용자 식별자) 추출
        String email = jwtTokenProvider.getUsernameFromJWT(token);

        // 서비스 호출: 이메일을 기반으로 사용자를 조회하고, 사용자 상세 정보를 등록함.
        try {
            userDetailMeTourokuService.registerUserDetails(requestDto, email);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponseDto(e.getMessage()));
        }

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponseDto("내 디테일 정보가 등록되었습니다."));
    }

    // 내 정보 보기 (UserDetailMeShowService)
    @GetMapping("/details")
    public ResponseEntity<?> getUserDetails(HttpServletRequest request) {
        // JWT 토큰 추출 (헤더에 "Authorization"에 담겨있다고 가정)
        String token = request.getHeader("Authorization");
        if (token == null || token.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponseDto("토큰이 존재하지 않습니다."));
        }

        // JWT 토큰 검증
        if (!jwtTokenProvider.validateToken(token)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ApiResponseDto("만료되거나 올바르지 않은 토큰 입니다."));
        }

        // 토큰에서 사용자 식별자(이메일) 추출
        String email = jwtTokenProvider.getUsernameFromJWT(token);

        // 서비스 호출: 이메일을 기준으로 사용자 디테일 정보 조회
        UserDetailResponseDTO responseDto;
        try {
            responseDto = userDetailMeShowService.getUserDetails(email);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponseDto(e.getMessage()));
        }

        // spec에 따른 응답 코드 (201 Created)와 함께 조회 결과 반환
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(responseDto);
    }


    // 내 정보 수정 (UserDetailUpdateService)
    @PatchMapping("/details")
    public ResponseEntity<ApiResponseDto> updateUserDetails(
            @RequestBody @Valid UserDetailUpdateDTO updateDto,
            HttpServletRequest request) {

        // JWT 토큰을 "Authorization" 헤더에서 추출
        String token = request.getHeader("Authorization");
        if (token == null || token.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponseDto("토큰이 존재하지 않습니다."));
        }

        // JWT 토큰 검증
        if (!jwtTokenProvider.validateToken(token)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ApiResponseDto("만료되거나 올바르지 않은 토큰 입니다."));
        }

        // 토큰에서 사용자 식별자(이메일) 추출
        String email = jwtTokenProvider.getUsernameFromJWT(token);

        // 서비스 호출: 이메일을 기준으로 사용자 상세 정보를 수정
        try {
            userDetailMeUpdateService.updateUserDetails(updateDto, email);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponseDto(e.getMessage()));
        }

        return ResponseEntity.status(HttpStatus.OK)
                .body(new ApiResponseDto("내 디테일 정보가 수정되었습니다."));
    }

}