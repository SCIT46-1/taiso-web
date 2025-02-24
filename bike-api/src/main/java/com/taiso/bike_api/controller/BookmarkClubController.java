package com.taiso.bike_api.controller;

import com.taiso.bike_api.dto.BookmarkClubListResponseDTO;
import com.taiso.bike_api.dto.BookmarkClubResponseDTO;
import com.taiso.bike_api.service.BookmarkClubService;
import java.util.Collections;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users/me/bookmarks/clubs")
public class BookmarkClubController {

    private final BookmarkClubService bookmarkClubService;

    @Autowired
    public BookmarkClubController(BookmarkClubService bookmarkClubService) {
        this.bookmarkClubService = bookmarkClubService;
    }


    // 북마크 클럽 등록
    @PostMapping("/{clubId}")
    public ResponseEntity<?> createBookmarkClub(@PathVariable("clubId") Long clubId,
                                                Authentication authentication) {
        // Authentication 객체에서 현재 사용자의 이메일 추출
        String reviewerEmail = authentication.getName();
        try {
            BookmarkClubResponseDTO responseDTO = bookmarkClubService.createBookmarkClub(clubId, reviewerEmail);
            return ResponseEntity.status(HttpStatus.CREATED).body(responseDTO);
        } catch (IllegalArgumentException e) {
            String errorMsg = e.getMessage();
            if ("대상 클럽을 찾을 수 없습니다.".equals(errorMsg)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Collections.singletonMap("message", errorMsg));
            } else if ("이미 북마크한 클럽입니다.".equals(errorMsg)) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Collections.singletonMap("message", errorMsg));
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Collections.singletonMap("message", errorMsg));
            }
        }
    }

    // 북마크 클럽 조회
    @GetMapping
    public ResponseEntity<?> getBookmarkedClubs(Authentication authentication) {
        // 인증 객체에서 현재 사용자의 이메일 추출
        String reviewerEmail = authentication.getName();

        try {
            BookmarkClubListResponseDTO responseDTO = bookmarkClubService.getBookmarkedClubs(reviewerEmail);
            // 스펙에 따르면 201 Created 응답
            return ResponseEntity.status(HttpStatus.CREATED).body(responseDTO);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("message", e.getMessage()));
        }
    }

    // 북마크 클럽 취소
    @DeleteMapping("/{clubId}")
    public ResponseEntity<?> cancelBookmarkClub(@PathVariable("clubId") Long clubId,
                                                Authentication authentication) {
        // Authentication 객체에서 현재 사용자의 이메일(식별자) 추출
        String reviewerEmail = authentication.getName();
        try {
            bookmarkClubService.cancelBookmarkClub(clubId, reviewerEmail);
            return ResponseEntity.status(HttpStatus.NO_CONTENT)
                    .body(Collections.singletonMap("message", "북마크를 삭제했습니다."));
        } catch (IllegalArgumentException e) {
            String errorMsg = e.getMessage();
            // "북마크한 게시글이 아닙니다."는 404 Not Found로 반환
            if ("북마크한 게시글이 아닙니다.".equals(errorMsg)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Collections.singletonMap("message", errorMsg));
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Collections.singletonMap("message", errorMsg));
            }
        }
    }
}
