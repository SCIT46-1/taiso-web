package com.taiso.bike_api.controller;

import com.taiso.bike_api.dto.BookmarkResponseDTO;
import com.taiso.bike_api.dto.BookmarkUserListResponseDTO;
import com.taiso.bike_api.service.BookmarkService;
import java.util.Collections;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users/me/bookmarks/users")
public class BookmarkController {

    private final BookmarkService bookmarkService;

    @Autowired
    public BookmarkController(BookmarkService bookmarkService) {
        this.bookmarkService = bookmarkService;
    }

    // 북마크 회원 등록
    @PostMapping("/{userId}")
    public ResponseEntity<?> createBookmark(@PathVariable("userId") Long targetUserId,
                                            Authentication authentication) {
        // Authentication 객체에서 현재 사용자의 식별자(이메일) 추출
        String reviewerEmail = authentication.getName();

        try {
            BookmarkResponseDTO responseDTO = bookmarkService.createBookmark(targetUserId, reviewerEmail);
            return ResponseEntity.status(HttpStatus.CREATED).body(responseDTO);
        } catch (IllegalArgumentException e) {
            String errorMsg = e.getMessage();
            // 에러에 따른 상태 코드를 반환합니다.
            if ("대상 회원을 찾을 수 없습니다.".equals(errorMsg)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Collections.singletonMap("message", errorMsg));
            } else if ("이미 북마크한 회원입니다.".equals(errorMsg)) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Collections.singletonMap("message", errorMsg));
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Collections.singletonMap("message", errorMsg));
            }
        }
    }

    // 북마크 회원 조회
    @GetMapping
    public ResponseEntity<?> getBookmarkedUsers(Authentication authentication) {
        // Authentication 객체에서 현재 사용자의 이메일 추출
        String reviewerEmail = authentication.getName();
        try {
            BookmarkUserListResponseDTO responseDTO = bookmarkService.getBookmarkedUsers(reviewerEmail);
            // 사양에 따르면 201 CREATED 응답 (비록 GET은 일반적으로 200 OK지만 스펙에 따름)
            return ResponseEntity.status(HttpStatus.CREATED).body(responseDTO);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("message", e.getMessage()));
        }
    }
}
