package com.taiso.bike_api.controller;

import com.taiso.bike_api.dto.ApiResponseDto;
import com.taiso.bike_api.dto.ClubJoinResponseDTO;
import com.taiso.bike_api.dto.ClubJoinAcceptResponseDTO;
import com.taiso.bike_api.dto.ClubJoinRejectResponseDTO;
import com.taiso.bike_api.security.JwtTokenProvider;
import com.taiso.bike_api.service.ClubMemberService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/clubs")
public class ClubMemberController {

    private final ClubMemberService clubMemberService;
    private final JwtTokenProvider jwtTokenProvider;

    @Autowired
    public ClubMemberController(ClubMemberService clubMemberService,
                                JwtTokenProvider jwtTokenProvider) {
        this.clubMemberService = clubMemberService;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    // 클럽 가입 신청
    @PostMapping("/{clubId}/members")
    public ResponseEntity<?> joinClub(@PathVariable("clubId") Long clubId,
                                      HttpServletRequest request) {
        // 1. JWT 토큰 추출
        String token = request.getHeader("Authorization");
        if (token == null || token.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponseDto("토큰이 존재하지 않습니다."));
        }

        // 2. JWT 토큰 검증
        if (!jwtTokenProvider.validateToken(token)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ApiResponseDto("만료되거나 올바르지 않은 토큰 입니다."));
        }

        // 3. 토큰에서 사용자 식별자(예: 이메일) 추출
        String email = jwtTokenProvider.getUsernameFromJWT(token);

        try {
            // 4. 서비스 호출하여 클럽 가입 신청 처리
            ClubJoinResponseDTO responseDto = clubMemberService.joinClub(clubId, email);
            return ResponseEntity.status(HttpStatus.OK).body(responseDto);
        } catch (IllegalArgumentException e) {
            String errorMsg = e.getMessage();
            // 에러 메시지에 따라 상태 코드 설정
            if (errorMsg.equals("클럽이 존재하지 않습니다.")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponseDto(errorMsg));
            } else if (errorMsg.equals("이미 해당 클럽에 참가 신청을 했습니다.") ||
                       errorMsg.equals("이미 해당 클럽에 참여했습니다.")) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(new ApiResponseDto(errorMsg));
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ApiResponseDto(errorMsg));
            }
        }
    }

    // 클럽 가입 승인
    @PatchMapping("/{clubId}/members/{userId}")
    public ResponseEntity<?> acceptClubJoin(
            @PathVariable("clubId") Long clubId,
            @PathVariable("userId") Long userId,
            HttpServletRequest request) {

        // 1. JWT 토큰 추출
        String token = request.getHeader("Authorization");
        if (token == null || token.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponseDto("토큰이 없엉."));
        }
        // 2. JWT 토큰 검증
        if (!jwtTokenProvider.validateToken(token)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ApiResponseDto("만료되거나 올바르지 않은 토큰 입니다."));
        }
        // 3. 토큰에서 관리자(어드민) 사용자 식별(예: 이메일 추출)
        String adminEmail = jwtTokenProvider.getUsernameFromJWT(token);

        try {
            // 4. 서비스 호출하여 클럽 가입 수락 처리
            ClubJoinAcceptResponseDTO responseDto = clubMemberService.acceptClubJoin(clubId, userId, adminEmail);
            return ResponseEntity.status(HttpStatus.OK).body(responseDto);
        } catch (IllegalArgumentException e) {
            String errorMsg = e.getMessage();
            // 에러 메시지에 따라 상태 코드 지정
            if (errorMsg.equals("해당 사용자의 참가 신청이 존재하지 않습니다.")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponseDto(errorMsg));
            } else if (errorMsg.equals("넌 이미 클럽 가입이 승인되었단다.")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ApiResponseDto(errorMsg));
            } else if (errorMsg.equals("관리자 권한이 필요합니다.")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ApiResponseDto(errorMsg));
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ApiResponseDto(errorMsg));
            }
        }
    }


    // 클럽 가입 거절
    @DeleteMapping("/{clubId}/members/{userId}")
    public ResponseEntity<?> rejectClubJoin(
            @PathVariable("clubId") Long clubId,
            @PathVariable("userId") Long userId,
            HttpServletRequest request) {

        // 1. JWT 토큰 추출
        String token = request.getHeader("Authorization");
        if (token == null || token.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponseDto("토큰이 없엉."));
        }
        // 2. JWT 토큰 검증
        if (!jwtTokenProvider.validateToken(token)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ApiResponseDto("만료되거나 올바르지 않은 토큰 입니다."));
        }
        // 3. 토큰에서 관리자(어드민) 식별(예: 이메일 추출)
        String adminEmail = jwtTokenProvider.getUsernameFromJWT(token);

        try {
            // 4. 서비스 호출하여 클럽 가입 거절 처리
            ClubJoinRejectResponseDTO responseDto = clubMemberService.rejectClubJoin(clubId, userId, adminEmail);
            return ResponseEntity.status(HttpStatus.OK).body(responseDto);
        } catch (IllegalArgumentException e) {
            String errorMsg = e.getMessage();
            if (errorMsg.equals("해당 사용자의 참가 신청이 존재하지 않습니다.")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponseDto(errorMsg));
            } else if (errorMsg.equals("넌 이미 클럽 가입이 승인되었단다.")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ApiResponseDto(errorMsg));
            } else if (errorMsg.equals("관리자 권한이 필요합니다.")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ApiResponseDto(errorMsg));
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ApiResponseDto(errorMsg));
            }
        }
    }
}
