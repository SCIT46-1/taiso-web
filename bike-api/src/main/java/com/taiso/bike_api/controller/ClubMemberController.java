package com.taiso.bike_api.controller;

import java.util.Collections;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.taiso.bike_api.dto.ClubJoinAcceptResponseDTO;
import com.taiso.bike_api.dto.ClubJoinRejectResponseDTO;
import com.taiso.bike_api.dto.ClubJoinResponseDTO;
import com.taiso.bike_api.service.ClubMemberService;

@RestController
@RequestMapping("/clubs")
public class ClubMemberController {

    @Autowired
    ClubMemberService clubMemberService;

    // 클럽 가입 신청
    @PostMapping("/{clubId}/members")
    public ResponseEntity<?> joinClub(@PathVariable("clubId") Long clubId,
                                      Authentication authentication) {
        // Authentication 객체에서 사용자 식별자(예: 이메일) 추출
        String email = authentication.getName();

        try {
            // 서비스 호출: 이메일을 기반으로 클럽 가입 신청 처리
            ClubJoinResponseDTO responseDto = clubMemberService.joinClub(clubId, email);
            return ResponseEntity.status(HttpStatus.OK).body(responseDto);
        } catch (IllegalArgumentException e) {
            String errorMsg = e.getMessage();
            if ("클럽이 존재하지 않습니다.".equals(errorMsg)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Collections.singletonMap("message", errorMsg));
            } else if ("이미 해당 클럽에 참가 신청을 했습니다.".equals(errorMsg) ||
                    "이미 해당 클럽에 참여했습니다.".equals(errorMsg)) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Collections.singletonMap("message", errorMsg));
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Collections.singletonMap("message", errorMsg));
            }
        }
    }

    // 클럽 가입 승인
    @PatchMapping("/{clubId}/members/{userId}")
    public ResponseEntity<?> acceptClubJoin(
            @PathVariable("clubId") Long clubId,
            @PathVariable("userId") Long userId,
            Authentication authentication) {

        // Authentication 객체에서 관리자(어드민) 식별 (예: 이메일 추출)
        String adminEmail = authentication.getName();

        try {
            // 서비스 호출하여 클럽 가입 수락 처리
            ClubJoinAcceptResponseDTO responseDto = clubMemberService.acceptClubJoin(clubId, userId, adminEmail);
            return ResponseEntity.status(HttpStatus.OK).body(responseDto);
        } catch (IllegalArgumentException e) {
            String errorMsg = e.getMessage();
            if ("해당 사용자의 참가 신청이 존재하지 않습니다.".equals(errorMsg)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Collections.singletonMap("message", errorMsg));
            } else if ("넌 이미 클럽 가입이 승인되었단다.".equals(errorMsg)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Collections.singletonMap("message", errorMsg));
            } else if ("관리자 권한이 필요합니다.".equals(errorMsg)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Collections.singletonMap("message", errorMsg));
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Collections.singletonMap("message", errorMsg));
            }
        }
    }

    // 클럽 가입 거절
    @DeleteMapping("/{clubId}/members/{userId}")
    public ResponseEntity<?> rejectClubJoin(
            @PathVariable("clubId") Long clubId,
            @PathVariable("userId") Long userId,
            Authentication authentication) {

        // Authentication 객체에서 관리자(어드민)의 이메일(식별자)를 추출
        String adminEmail = authentication.getName();

        try {
            // 서비스 호출하여 클럽 가입 거절 처리
            ClubJoinRejectResponseDTO responseDto = clubMemberService.rejectClubJoin(clubId, userId, adminEmail);
            return ResponseEntity.status(HttpStatus.OK).body(responseDto);
        } catch (IllegalArgumentException e) {
            String errorMsg = e.getMessage();
            if ("해당 사용자의 참가 신청이 존재하지 않습니다.".equals(errorMsg)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Collections.singletonMap("message", errorMsg));
            } else if ("넌 이미 클럽 가입이 승인되었단다.".equals(errorMsg)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Collections.singletonMap("message", errorMsg));
            } else if ("관리자 권한이 필요합니다.".equals(errorMsg)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Collections.singletonMap("message", errorMsg));
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Collections.singletonMap("message", errorMsg));
            }
        }
    }
}
