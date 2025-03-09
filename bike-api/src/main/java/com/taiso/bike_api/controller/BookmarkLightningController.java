package com.taiso.bike_api.controller;

import com.taiso.bike_api.dto.BookmarkLightningResponseDTO;
import com.taiso.bike_api.dto.BookmarkUserDeleteResponseDTO;
import com.taiso.bike_api.dto.BookmarkUserListResponseDTO;
import com.taiso.bike_api.dto.BookmarkUserResponseDTO;
import com.taiso.bike_api.service.BookmarkLightningService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@Slf4j
@RequestMapping("/api/users/me/bookmarks/lightnings")
@Tag(name = "북마크 번개 컨트롤러", description = "북마크  관련 API")
public class BookmarkLightningController {

    @Autowired
    private BookmarkLightningService bookmarkLightningService;

    @PostMapping("/{lightningId}")
    @Operation(summary = "북마크 번개 등록", description = "북마크 번개 등록 API")
    public ResponseEntity<BookmarkLightningResponseDTO> bookmarkLightningCreate(
            @PathVariable(name = "lightningId") Long lightningId,
            Authentication authentication) {

        bookmarkLightningService.bookmarkLightningCreate(lightningId, authentication);

        return ResponseEntity.status(HttpStatus.CREATED).body(null);
    }


    @GetMapping("")
    @Operation(summary = "북마크 번개 조회", description = "북마크 번개 조회 API")
    public ResponseEntity<List<BookmarkLightningResponseDTO>> BookmarkLightningList(
            Authentication authentication) {

        List<BookmarkLightningResponseDTO> responseDTOs = bookmarkLightningService.bookmarkLightningList(authentication);

        return  ResponseEntity.status(HttpStatus.OK).body(responseDTOs);
    }


    @DeleteMapping("/{bookmarkId}")
    @Operation(summary = "북마크 번개 삭제", description = "북마크 번개 삭제 API")
    public ResponseEntity<BookmarkLightningResponseDTO> BookmarkLightningDelete(
            @PathVariable(name = "bookmarkId") Long bookmarkId,
            Authentication authentication
    ) {
        bookmarkLightningService.bookmarkLightningDelete(bookmarkId, authentication);

        return  ResponseEntity.status(HttpStatus.NO_CONTENT).body(null);
    }




}
