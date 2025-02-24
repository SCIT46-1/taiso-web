package com.taiso.bike_api.controller;

import com.taiso.bike_api.dto.UserReviewResponseDTO;
import com.taiso.bike_api.service.UserReviewService;
import io.swagger.v3.oas.annotations.Operation;
import java.util.Collections;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
public class UserReviewController {

    private final UserReviewService userReviewService;

    @Autowired
    public UserReviewController(UserReviewService userReviewService) {
        this.userReviewService = userReviewService;
    }

    @GetMapping("/{userId}/lightnings/{lightningId}/reviews")
    @Operation(summary = "내가 작성한 회원 리뷰 조회",
            description = "내 예약/완료 번개 정보 조회 시, 리뷰가 작성되어 있다면 해당 리뷰들을 조회합니다. " +
                    "review_db에서 reviewed_id가 해당 userId인 리뷰를, 주어진 lightningId로 필터링합니다.")
    public ResponseEntity<?> getUserReviews(
            @PathVariable("userId") Long reviewedId,
            @PathVariable("lightningId") Long lightningId,
            Authentication authentication) {

        // (선택사항) 인증된 사용자가 조회 대상과 일치하는지 확인할 수 있습니다.
        // 예: if (!authentication.getName().equals( ... )) { ... }

        try {
            List<UserReviewResponseDTO> reviews = userReviewService.getUserReviews(reviewedId, lightningId);
            return ResponseEntity.status(HttpStatus.CREATED).body(reviews);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("message", e.getMessage()));
        }
    }
}
