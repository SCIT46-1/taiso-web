package com.taiso.bike_api.controller;

import com.taiso.bike_api.dto.BookmarkLightningListResponseDTO;
import com.taiso.bike_api.dto.BookmarkLightningResponseDTO;
import com.taiso.bike_api.service.BookmarkLightningService;
import java.util.Collections;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users/me/bookmarks/lightnings")
public class BookmarkLightningController {

    private final BookmarkLightningService bookmarkLightningService;

    @Autowired
    public BookmarkLightningController(BookmarkLightningService bookmarkLightningService) {
        this.bookmarkLightningService = bookmarkLightningService;
    }

    // 북마크 번개 등록
    @PostMapping("/{lightningId}")
    public ResponseEntity<?> createBookmark(
            @PathVariable("lightningId") Long lightningId,
            Authentication authentication) {

        // Authentication 객체에서 현재 사용자의 이메일 추출
        String reviewerEmail = authentication.getName();

        try {
            BookmarkLightningResponseDTO responseDTO = bookmarkLightningService.createBookmark(lightningId, reviewerEmail);
            return ResponseEntity.status(HttpStatus.CREATED).body(responseDTO);
        } catch (IllegalArgumentException e) {
            String errorMsg = e.getMessage();
            if ("대상 번개를 찾을 수 없습니다.".equals(errorMsg)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Collections.singletonMap("message", errorMsg));
            } else if ("이미 북마크한 번개입니다.".equals(errorMsg)) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Collections.singletonMap("message", errorMsg));
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Collections.singletonMap("message", errorMsg));
            }
        }
    }

    // 북마크 번개 조회
    @GetMapping
    public ResponseEntity<?> getBookmarkLightnings(Authentication authentication) {
        // Authentication 객체가 없으면 UNAUTHORIZED 응답
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Collections.singletonMap("message", "토큰이 존재하지 않습니다."));
        }
        String reviewerEmail = authentication.getName();

        try {
            BookmarkLightningListResponseDTO responseDTO = bookmarkLightningService.getBookmarkLightnings(reviewerEmail);
            // 사양에 따르면 201 CREATED 응답 (GET일 경우 일반적으로 200 OK이나, 스펙에 따름)
            return ResponseEntity.status(HttpStatus.CREATED).body(responseDTO);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("message", e.getMessage()));
        }
    }
}
