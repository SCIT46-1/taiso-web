package com.taiso.bike_api.controller;

import com.taiso.bike_api.dto.BookmarkRouteResponseDTO;
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
}
