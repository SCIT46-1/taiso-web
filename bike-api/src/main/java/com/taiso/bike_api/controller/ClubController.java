package com.taiso.bike_api.controller;

import com.taiso.bike_api.dto.ApiResponseDto;
import com.taiso.bike_api.dto.ClubCreateRequestDTO;
import com.taiso.bike_api.security.JwtTokenProvider;
import com.taiso.bike_api.service.ClubService;
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
@RequestMapping("/clubs")
public class ClubController {

    private final ClubService clubService;
    private final JwtTokenProvider jwtTokenProvider;

    @Autowired
    public ClubController(ClubService clubService, JwtTokenProvider jwtTokenProvider) {
        this.clubService = clubService;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @PostMapping
    public ResponseEntity<ApiResponseDto> createClub(
            @RequestBody @Valid ClubCreateRequestDTO requestDto,
            HttpServletRequest request) {
        
        // 1. JWT 토큰 추출 및 검증
        String token = request.getHeader("Authorization");
        if (token == null || token.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponseDto("토큰이 없엉."));
        }
        if (!jwtTokenProvider.validateToken(token)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ApiResponseDto("만료되거나 올바르지 않은 토큰 입니다."));
        }
        
        // 2. JWT 토큰에서 현재 사용자(클럽 생성자의) 식별 (예: 이메일)
        String email = jwtTokenProvider.getUsernameFromJWT(token);
        
        try {
            // 3. 서비스 호출하여 클럽 생성 처리
            clubService.createClub(requestDto, email);
            return ResponseEntity.status(HttpStatus.OK)
                    .body(new ApiResponseDto("클럽 생성이 완료 되었습니다."));
        } catch (IllegalArgumentException e) {
            String errorMsg = e.getMessage();
            if (errorMsg.equals("이미 존재하는 클럽명입니다.")) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(new ApiResponseDto(errorMsg));
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ApiResponseDto(errorMsg));
            }
        }
    }
}
