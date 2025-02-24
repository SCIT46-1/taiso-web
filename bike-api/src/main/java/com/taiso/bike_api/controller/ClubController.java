package com.taiso.bike_api.controller;

import com.taiso.bike_api.dto.ClubCreateRequestDTO;
import com.taiso.bike_api.dto.ClubUpdateRequestDTO;
import com.taiso.bike_api.dto.ClubInfoUpdateRequestDTO;
import com.taiso.bike_api.dto.ClubInfoUpdateResponseDTO;

import com.taiso.bike_api.dto.ClubListItemDTO;
import com.taiso.bike_api.service.ClubService;
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

import java.util.Collections;

@RestController
@RequestMapping("/api/clubs")
public class ClubController {

    @Autowired
    ClubService clubService;

    // 클럽 생성
    @PostMapping
    public ResponseEntity<?> createClub(
            @RequestBody @Valid ClubCreateRequestDTO requestDto,
            Authentication authentication) {

        // Authentication 객체에서 현재 사용자(클럽 생성자)의 이메일 추출
        String email = authentication.getName();

        try {
            // 서비스 호출하여 클럽 생성 처리
            clubService.createClub(requestDto, email);
            return ResponseEntity.status(HttpStatus.OK)
                    .body(Collections.singletonMap("message", "클럽 생성이 완료 되었습니다."));
        } catch (IllegalArgumentException e) {
            String errorMsg = e.getMessage();
            if ("이미 존재하는 클럽명입니다.".equals(errorMsg)) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Collections.singletonMap("message", errorMsg));
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Collections.singletonMap("message", errorMsg));
            }
        }
    }

    // 클럽 리스트 조회
    @GetMapping
    public ResponseEntity<?> getClubList(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {

        // 인증 객체가 null이면 인증이 되지 않은 것으로 간주합니다.
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Collections.singletonMap("message", "토큰이 없엉."));
        }

        // 현재 인증된 사용자 정보는 authentication.getName() 등을 통해 활용 가능
        Page<ClubListItemDTO> clubPage = clubService.getClubList(page, size);
        return ResponseEntity.status(HttpStatus.OK).body(clubPage);
    }

    // 클럽 정보 수정
    @PatchMapping("/{clubId}")
    public ResponseEntity<?> updateClub(
            @PathVariable("clubId") Long clubId,
            @RequestBody @Valid ClubUpdateRequestDTO updateDto,
            Authentication authentication) {

        // Authentication 객체에서 관리자(어드민)의 이메일(식별자)을 추출합니다.
        String adminEmail = authentication.getName();

        try {
            clubService.updateClub(clubId, updateDto, adminEmail);
            return ResponseEntity.status(HttpStatus.OK)
                    .body(Collections.singletonMap("message", "클럽 수정이 완료되었습니다."));
        } catch (IllegalArgumentException e) {
            String errorMsg = e.getMessage();
            if ("이미 존재하는 클럽명입니다.".equals(errorMsg)) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Collections.singletonMap("message", errorMsg));
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Collections.singletonMap("message", errorMsg));
            }
        }
    }

    // 클럽 소개글 수정
    @PatchMapping("/{clubId}/info")
    public ResponseEntity<?> updateClubInfo(
            @PathVariable("clubId") Long clubId,
            @RequestBody @Valid ClubInfoUpdateRequestDTO requestDto,
            Authentication authentication) {

        // Authentication 객체에서 관리자(어드민)의 이메일(혹은 식별자)을 추출합니다.
        String email = authentication.getName();

        try {
            ClubInfoUpdateResponseDTO responseDto = clubService.updateClubInfo(clubId, requestDto, email);
            return ResponseEntity.status(HttpStatus.OK).body(responseDto);
        } catch (IllegalArgumentException e) {
            String errMsg = e.getMessage();
            if ("소개글이 비어있습니다.".equals(errMsg)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Collections.singletonMap("message", errMsg));
            } else if ("클럽 소개글이 허용된 길이를 초과했습니다.".equals(errMsg)) {
                return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
                        .body(Collections.singletonMap("message", errMsg));
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Collections.singletonMap("message", errMsg));
            }
        }
    }
}
