package com.taiso.bike_api.controller;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.taiso.bike_api.dto.ClubBoardGetResponseDTO;
import com.taiso.bike_api.dto.ClubBoardListResponseDTO;
import com.taiso.bike_api.dto.ClubBoardPatchRequestDTO;
import com.taiso.bike_api.dto.ClubBoardPostRequestDTO;
import com.taiso.bike_api.service.ClubBoardService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;

@RestController
@Slf4j
@RequestMapping("/api/clubs/{clubId}/boards")
@Tag(name = "클럽 보드 컨트롤러", description = "클럽 보드 관련 API")
public class ClubBoardController {

    @Autowired
    private ClubBoardService clubBoardService;

    @Operation(summary = "클럽 게시글 생성", description = "클럽 게시글 생성 API")
    @PostMapping("")
    public ResponseEntity<ClubBoardPostRequestDTO> createClubBoard(
                                        @RequestBody ClubBoardPostRequestDTO clubBoardPostRequestDTO
                                        , @PathVariable(name = "clubId") Long clubId
                                        , Authentication authentication) {

        log.info("로직 시작 시 들어온 DTO : {}", clubBoardPostRequestDTO.toString());
        clubBoardService.createClubBoard(clubBoardPostRequestDTO, clubId, authentication);

        return ResponseEntity.status(HttpStatus.CREATED).body(null);
    }

    @Operation(summary = "클럽 게시글 삭제", description = "클럽 게시글 삭제 API")
    @DeleteMapping("/{boardId}")
    public ResponseEntity<ClubBoardPostRequestDTO> deleteClubBoard (
                                                @PathVariable(name = "clubId") Long clubId
                                                , @PathVariable(name = "boardId") Long boardId
                                                , Authentication authentication) {

        log.info("로직 시작 시 들어온 클럽ID : {}", clubId);
        log.info("로직 시작 시 들어온 보드ID : {}", boardId);
        clubBoardService.deleteClubBoard(clubId, boardId, authentication);

        return ResponseEntity.status(HttpStatus.CREATED).body(null);
    }

    // 수정 화면 조회 API 추가작업 해야함

    @Operation(summary = "클럽 게시글 수정", description = "클럽 게시글 수정 API")
    @PatchMapping("/{boardId}")
    public ResponseEntity<ClubBoardPostRequestDTO> patchClubBoard (
                                        @RequestBody ClubBoardPatchRequestDTO clubBoardPatchRequestDTO
                                        , @PathVariable(name = "clubId") Long clubId
                                        , @PathVariable(name = "boardId") Long boardId
                                        , Authentication authentication) {

        clubBoardService.patchClubBoard(clubBoardPatchRequestDTO, clubId, boardId, authentication);

        return ResponseEntity.status(HttpStatus.CREATED).body(null);
    }

    @Operation(summary = "클럽 게시글 조회", description = "클럽 게시글 조회 API")
    @GetMapping("/{boardId}")
    public ResponseEntity<ClubBoardGetResponseDTO> getCluBoardOne (
                                                @PathVariable(name = "clubId") Long clubId
                                                , @PathVariable(name = "boardId") Long boardId
                                                , Authentication authentication) {
        ClubBoardGetResponseDTO clubBoardGetResponseDTO = clubBoardService.getClubBoardOne(clubId, boardId, authentication);

        return ResponseEntity.status(HttpStatus.CREATED).body(clubBoardGetResponseDTO);
    }

    @GetMapping("")
    @Operation(summary = "클럽 보드 리스트 조회", description = "클럽 보드 리스트 조회 API")
    public ResponseEntity<ClubBoardListResponseDTO> getClubBoardList(
            @RequestParam(name = "page", defaultValue = "0") int page
            , @RequestParam(name = "size", defaultValue = "8") int size
            , @RequestParam(name = "sort", defaultValue = "") String sort
            , @PathVariable(name = "clubId") Long clubId
            , Authentication authentication){

        ClubBoardListResponseDTO clubBoardListResponseDTO = clubBoardService.getClubBoardList(page, size, sort, clubId ,authentication);

        return ResponseEntity.status(HttpStatus.CREATED).body(clubBoardListResponseDTO);
    }



}
