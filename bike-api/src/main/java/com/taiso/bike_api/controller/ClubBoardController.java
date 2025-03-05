package com.taiso.bike_api.controller;


import com.taiso.bike_api.dto.ClubBoardPatchRequestDTO;
import com.taiso.bike_api.dto.ClubBoardPostRequestDTO;
import com.taiso.bike_api.service.ClubBoardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@Slf4j
@RequestMapping("/api/clubs")
@Tag(name = "클럽 보드 컨트롤러", description = "클럽 보드 관련 API")
public class ClubBoardController {

    @Autowired
    private ClubBoardService clubBoardService;

    @Operation(summary = "클럽 게시글 생성", description = "클럽 게시글 생성 API")
    @PostMapping("/{clubId}/boards")
    public ResponseEntity<ClubBoardPostRequestDTO> createClubBoard(
                                        @RequestBody ClubBoardPostRequestDTO clubBoardPostRequestDTO
                                        , @PathVariable Long clubId
                                        , Authentication authentication) {

        log.info("로직 시작 시 들어온 DTO : {}", clubBoardPostRequestDTO.toString());
        clubBoardService.createClubBoard(clubBoardPostRequestDTO, clubId, authentication);

        return ResponseEntity.status(HttpStatus.CREATED).body(null);
    }

    @Operation(summary = "클럽 게시글 삭제", description = "클럽 게시글 삭제 API")
    @DeleteMapping("/{clubId}/boards/{boardId}")
    public ResponseEntity<ClubBoardPostRequestDTO> deleteClubBoard (
                                                @PathVariable Long clubId
                                                , @PathVariable Long boardId
                                                , Authentication authentication) {

        log.info("로직 시작 시 들어온 클럽ID : {}", clubId);
        log.info("로직 시작 시 들어온 보드ID : {}", boardId);
        clubBoardService.deleteClubBoard(clubId, boardId, authentication);

        return ResponseEntity.status(HttpStatus.ACCEPTED).body(null);
    }

    // 수정 화면 조회 API 추가작업 해야함

    @Operation(summary = "클럽 게시글 수정", description = "클럽 게시글 수정 API")
    @PatchMapping("/{clubId}/boards/{boardId}")
    public ResponseEntity<ClubBoardPostRequestDTO> deleteClubBoard (
                                        @RequestBody ClubBoardPatchRequestDTO clubBoardPatchRequestDTO
                                        , @PathVariable Long clubId
                                        , @PathVariable Long boardId
                                        , Authentication authentication) {

        clubBoardService.patchClubBoard(clubBoardPatchRequestDTO, clubId, boardId, authentication);

        return ResponseEntity.status(HttpStatus.ACCEPTED).body(null);
    }



}
