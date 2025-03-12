package com.taiso.bike_api.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.taiso.bike_api.dto.BookmarkClubCreateResponseDTO;
import com.taiso.bike_api.dto.BookmarkClubDeleteResponseDTO;
import com.taiso.bike_api.dto.BookmarkClubsGetResponseDTO;
import com.taiso.bike_api.service.BookmarkClubService;

import io.swagger.v3.oas.annotations.Operation;


@RestController
@RequestMapping("/api/users/me/bookmarks/clubs")
public class BookmarkClubController {

    @Autowired
    private BookmarkClubService bookmarkClubService;

    @GetMapping("")
    @Operation(summary = "북마크한 클럽 목록 조회", description = "북마크한 클럽 목록을 조회합니다.")
    public ResponseEntity<BookmarkClubsGetResponseDTO> getBookmarkClubs(
        @RequestParam(name = "page", defaultValue = "0") int page
        , @RequestParam(name = "size", defaultValue = "8") int size
        , @RequestParam(name = "sort", defaultValue = "") String sort
        , @AuthenticationPrincipal String userEmail) {
        return ResponseEntity.status(HttpStatus.OK).body(bookmarkClubService.getBookmarkClubs(page, size, sort, userEmail));
    }

    @PostMapping("/{clubId}")
    @Operation(summary = "북마크 생성", description = "북마크를 생성합니다.")
    public ResponseEntity<BookmarkClubCreateResponseDTO> createBookmarkClub(
        @PathVariable(name = "clubId") Long clubId
        , Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED).body(bookmarkClubService.createBookmarkClub(clubId, authentication));
    }

    @DeleteMapping("/{clubId}")
    @Operation(summary = "북마크 삭제", description = "북마크를 삭제합니다.")
    public ResponseEntity<BookmarkClubDeleteResponseDTO> deleteBookmarkClub(
        @PathVariable(name = "clubId") Long clubId
        , Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED).body(bookmarkClubService.deleteBookmarkClub(clubId, authentication));
    }
    
}