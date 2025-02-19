package com.taiso.bike_api.controller;

import com.taiso.bike_api.dto.ApiResponseDto;
import com.taiso.bike_api.dto.UserDetailRequestDTO;
import com.taiso.bike_api.security.JwtTokenProvider;
import com.taiso.bike_api.service.UserDetailService;
import com.taiso.bike_api.service.UserDetailMeTourokuService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/users/me")
public class UserDetailController {

    private final UserDetailService userDetailService;
    private final UserDetailMeTourokuService userDetailMeTourokuService;
    private final JwtTokenProvider jwtTokenProvider;

    @Autowired
    public UserDetailController(UserDetailService userDetailService,
                                UserDetailMeTourokuService userDetailMeTourokuService,
                                JwtTokenProvider jwtTokenProvider
                                ) {
        this.userDetailService = userDetailService;
        this.jwtTokenProvider = jwtTokenProvider;
        this.userDetailMeTourokuService = userDetailMeTourokuService;
    }

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
}
