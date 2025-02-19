package com.taiso.bike_api.controller;

import com.taiso.bike_api.dto.ApiResponseDto;
import com.taiso.bike_api.dto.ClubCreateRequestDTO;
import com.taiso.bike_api.dto.ClubUpdateRequestDTO;
import com.taiso.bike_api.dto.ClubInfoUpdateRequestDTO;
import com.taiso.bike_api.dto.ClubInfoUpdateResponseDTO;

import com.taiso.bike_api.security.JwtTokenProvider;
import com.taiso.bike_api.dto.ClubListItemDTO;
import com.taiso.bike_api.service.ClubService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.Authentication;

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

    // 클럽 생성
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

    // 클럽 리스트 조회
    @GetMapping
    public ResponseEntity<?> getClubList(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest request) {

        // JWT 토큰 추출 및 검증
        String token = request.getHeader("Authorization");
        if (token == null || token.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponseDto("토큰이 없엉."));
        }
        if (!jwtTokenProvider.validateToken(token)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ApiResponseDto("만료되거나 올바르지 않은 토큰 입니다."));
        }
        
        // 페이징 적용하여 클럽 리스트 조회
        Page<ClubListItemDTO> clubPage = clubService.getClubList(page, size);
        return ResponseEntity.status(HttpStatus.OK).body(clubPage);
    }

    // 클럽 정보 수정
    @PatchMapping("/{clubId}")
    public ResponseEntity<ApiResponseDto> updateClub(
            @PathVariable("clubId") Long clubId,
            @RequestBody @Valid ClubUpdateRequestDTO updateDto,
            HttpServletRequest request) {
        
        // JWT 토큰 추출
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
        // 토큰에서 관리자(어드민) 식별 (예: 이메일)
        String adminEmail = jwtTokenProvider.getUsernameFromJWT(token);
        
        try {
            clubService.updateClub(clubId, updateDto, adminEmail);
            return ResponseEntity.status(HttpStatus.OK)
                    .body(new ApiResponseDto("클럽 수정이 완료되었습니다."));
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

    // 클럽 소개글 수정 (jwt 모범 답안 버젼?)
    @PatchMapping("/{clubId}/info")
    public ResponseEntity<?> updateClubInfo(
        @PathVariable("clubId") Long clubId,
        @RequestBody @Valid ClubInfoUpdateRequestDTO requestDto,
        Authentication authentication) {

    // Authentication 객체에서 관리자(어드민)의 이메일(혹은 ID) 추출
    String email = authentication.getName();
    
    try {
        ClubInfoUpdateResponseDTO responseDto = clubService.updateClubInfo(clubId, requestDto, email);
        return ResponseEntity.status(HttpStatus.OK).body(responseDto);
    } catch (IllegalArgumentException e) {
        String errMsg = e.getMessage();
        if ("소개글이 비어있습니다.".equals(errMsg)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponseDto(errMsg));
        } else if ("클럽 소개글이 허용된 길이를 초과했습니다.".equals(errMsg)) {
            return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
                    .body(new ApiResponseDto(errMsg));
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponseDto(errMsg));
        }
    }
}

}
