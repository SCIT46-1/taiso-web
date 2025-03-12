package com.taiso.bike_api.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.taiso.bike_api.dto.ClubDescriptionUpdateRequestDTO;
import com.taiso.bike_api.dto.ClubDescriptionUpdateResponseDTO;
import com.taiso.bike_api.dto.ClubDetailGetResponseDTO;
import com.taiso.bike_api.dto.ClubDetailsUpdateRequestDTO;
import com.taiso.bike_api.dto.ClubDetailsUpdateResponseDTO;
import com.taiso.bike_api.dto.ClubListResponseDTO;
import com.taiso.bike_api.service.ClubService;

import io.swagger.v3.oas.annotations.Operation;


@RestController
@RequestMapping("/api/clubs")
public class ClubController {

    @Autowired
    private ClubService clubService;
    
    @GetMapping("/{clubId}")
    @Operation(summary = "클럽 상세 조회", description = "번개 상세 조회 API")
    public ResponseEntity<ClubDetailGetResponseDTO> getClubDetail(@PathVariable(name = "clubId") Long clubId) {
        return ResponseEntity.status(HttpStatus.OK).body(clubService.getClubDetail(clubId));
    }

    @GetMapping("")
    @Operation(summary = "클럽 리스트 조회", description = "번개 리스트 조회 API")
    public ResponseEntity<ClubListResponseDTO> getClubs(
              @RequestParam(name = "page", defaultValue = "0") int page
            , @RequestParam(name = "size", defaultValue = "8") int size
            , @RequestParam(name = "tags", defaultValue = "") String tags
            , @RequestParam(name = "sort", defaultValue = "") String sort
            , @AuthenticationPrincipal String userEmail) {
        return ResponseEntity.status(HttpStatus.OK).body(clubService.getClubs(page, size, tags, sort, userEmail));
    }

    @PatchMapping("/{clubId}/description")
    @Operation(summary = "클럽 소개글 수정", description = "번개 소개글 수정 API")
    public ResponseEntity<ClubDescriptionUpdateResponseDTO> updateClubDescription(
        @PathVariable(name = "clubId") Long clubId
        , @RequestBody ClubDescriptionUpdateRequestDTO requestDTO
        , Authentication authentication) {
        return ResponseEntity.status(HttpStatus.OK).body(clubService.updateClubDescription(clubId, requestDTO, authentication));
    }

    @PatchMapping("/{clubId}")
    @Operation(summary = "클럽 상세 수정", description = "번개 상세 수정 API")
    public ResponseEntity<ClubDetailsUpdateResponseDTO> updateClubDetails(
        @PathVariable(name = "clubId") Long clubId
        , @RequestBody ClubDetailsUpdateRequestDTO requestDTO
        , Authentication authentication) {
        return ResponseEntity.status(HttpStatus.OK).body(clubService.updateClubDetails(clubId, requestDTO, authentication));
    }




}
