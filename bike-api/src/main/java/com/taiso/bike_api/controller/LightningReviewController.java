package com.taiso.bike_api.controller;

import com.taiso.bike_api.dto.LightningReviewWriteScreenDTO;
import com.taiso.bike_api.service.LightningReviewService;
import io.swagger.v3.oas.annotations.Operation;
import java.util.Collections;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/lightnings")
public class LightningReviewController {

    private final LightningReviewService lightningReviewService;

    @Autowired
    public LightningReviewController(LightningReviewService lightningReviewService) {
        this.lightningReviewService = lightningReviewService;
    }

    @GetMapping("/{lightningId}/reviews")
    @Operation(summary = "내 완료 번개 참여회원 리뷰 작성화면",
            description = "번개 종료 후, 현재 사용자가 아직 리뷰를 작성하지 않은 참여 회원들의 정보를 조회합니다.")
    public ResponseEntity<?> getReviewWriteScreen(
            @PathVariable("lightningId") Long lightningId,
            Authentication authentication) {

        // 인증 객체가 없으면 UNAUTHORIZED
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Collections.singletonMap("message", "토큰이 없엉."));
        }
        String reviewerEmail = authentication.getName();
        try {
            List<LightningReviewWriteScreenDTO> dtos = lightningReviewService.getReviewWriteScreen(lightningId, reviewerEmail);
            return ResponseEntity.status(HttpStatus.OK).body(dtos);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("message", e.getMessage()));
        }
    }
}
