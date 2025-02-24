package com.taiso.bike_api.controller;

import com.taiso.bike_api.dto.UserReviewRequestDTO;
import com.taiso.bike_api.service.UserReviewService;
import java.util.Collections;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/lightnings")
public class UserReviewController {

    private final UserReviewService userReviewService;

    @Autowired
    public UserReviewController(UserReviewService userReviewService) {
        this.userReviewService = userReviewService;
    }

    @PostMapping("/{lightningId}/reviews/{userId}")
    public ResponseEntity<?> createUserReview(
            @PathVariable("lightningId") Long lightningId,
            @PathVariable("userId") Long reviewedId,
            @RequestBody @Valid UserReviewRequestDTO requestDto,
            Authentication authentication) {

        // JWT 인증이 완료된 상태에서 Authentication 객체를 통해 리뷰어의 이메일(식별자)를 추출합니다.
        String reviewerEmail = authentication.getName();

        try {
            userReviewService.createReview(lightningId, reviewedId, reviewerEmail, requestDto);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Collections.singletonMap("message", "해당 회원에 대한 리뷰가 등록되었습니다."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("message", e.getMessage()));
        }
    }
}
