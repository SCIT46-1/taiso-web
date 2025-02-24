package com.taiso.bike_api.controller;

import com.taiso.bike_api.dto.ClubDetailResponseDTO;
import com.taiso.bike_api.service.ClubService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;

@RestController
@RequestMapping("/clubs")
public class ClubDetailController {

    ClubService clubService;

    @GetMapping("/{clubId}")
    public ResponseEntity<?> getClubDetail(@PathVariable("clubId") Long clubId,
                                           Authentication authentication) {
        // (선택적) 인증 정보가 없다면 UNAUTHORIZED 응답
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Collections.singletonMap("message", "인증 정보가 없습니다."));
        }

        try {
            ClubDetailResponseDTO responseDto = clubService.getClubDetail(clubId);
            return ResponseEntity.status(HttpStatus.OK).body(responseDto);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("message", "요청 형식이 올바르지 않습니다."));
        }
    }
}
