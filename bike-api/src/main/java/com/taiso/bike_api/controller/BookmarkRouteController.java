package com.taiso.bike_api.controller;

import com.taiso.bike_api.dto.BookmarkRouteResponseDTO;
import com.taiso.bike_api.dto.BookmarkRouteListResponseDTO;

import com.taiso.bike_api.service.BookmarkRouteService;
import java.util.Collections;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users/me/bookmarks/routes")
public class BookmarkRouteController {

    private final BookmarkRouteService bookmarkRouteService;

    @Autowired
    public BookmarkRouteController(BookmarkRouteService bookmarkRouteService) {
        this.bookmarkRouteService = bookmarkRouteService;
    }

    // 북마크 루트 등록
    @PostMapping("/{routeId}")
    public ResponseEntity<?> createBookmark(@PathVariable("routeId") Long routeId,
                                            Authentication authentication) {
        // Authentication 객체에서 현재 사용자의 이메일 추출
        String reviewerEmail = authentication.getName();

        try {
            BookmarkRouteResponseDTO responseDTO = bookmarkRouteService.createBookmark(routeId, reviewerEmail);
            return ResponseEntity.status(HttpStatus.CREATED).body(responseDTO);
        } catch (IllegalArgumentException e) {
            String errorMsg = e.getMessage();
            if ("대상 루트를 찾을 수 없습니다.".equals(errorMsg)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Collections.singletonMap("message", errorMsg));
            } else if ("이미 북마크한 루트입니다.".equals(errorMsg)) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Collections.singletonMap("message", errorMsg));
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Collections.singletonMap("message", errorMsg));
            }
        }
    }


    // 북마크 루트 조회
    @GetMapping
    public ResponseEntity<?> getBookmarkRoutes(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Collections.singletonMap("message", "토큰이 존재하지 않습니다."));
        }

        String reviewerEmail = authentication.getName();
        try {
            BookmarkRouteListResponseDTO responseDTO = bookmarkRouteService.getBookmarkRoutes(reviewerEmail);
            // 스펙에 따라 201 CREATED 응답 사용 (GET은 일반적으로 200 OK이지만 스펙대로 작성)
            return ResponseEntity.status(HttpStatus.CREATED).body(responseDTO);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("message", e.getMessage()));
        }
    }

    // 북마크 루트 삭제
    @DeleteMapping("/{routeId}")
    public ResponseEntity<?> cancelBookmarkRoute(@PathVariable("routeId") Long routeId,
                                                 Authentication authentication) {
        // Authentication 객체에서 현재 사용자의 이메일(식별자) 추출
        String reviewerEmail = authentication.getName();
        try {
            bookmarkRouteService.cancelBookmarkRoute(routeId, reviewerEmail);
            return ResponseEntity.status(HttpStatus.NO_CONTENT)
                    .body(Collections.singletonMap("message", "북마크를 삭제했습니다."));
        } catch (IllegalArgumentException e) {
            String errorMsg = e.getMessage();
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
