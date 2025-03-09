package com.taiso.bike_api.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.taiso.bike_api.dto.BookmarkClubCreateResponseDTO;
import com.taiso.bike_api.dto.BookmarkClubsGetResponseDTO;
import com.taiso.bike_api.service.BookmarkClubService;


@RestController
@RequestMapping("/api/users/me/bookmarks/clubs")
public class BookmarkClubController {

    @Autowired
    private BookmarkClubService bookmarkClubService;

    @GetMapping("")
    public ResponseEntity<List<BookmarkClubsGetResponseDTO>> getBookmarkClubs(Authentication authentication) {
        return ResponseEntity.status(HttpStatus.OK).body(bookmarkClubService.getBookmarkClubs(authentication));
    }

    @PostMapping("/{clubId}")
    public ResponseEntity<BookmarkClubCreateResponseDTO> createBookmarkClub(
        @PathVariable(name = "clubId") Long clubId
        , Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED).body(bookmarkClubService.createBookmarkClub(clubId, authentication));
    }
    
}