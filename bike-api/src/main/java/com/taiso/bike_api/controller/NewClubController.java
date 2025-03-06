package com.taiso.bike_api.controller;

import com.taiso.bike_api.dto.ClubCreateRequestDTO;
import com.taiso.bike_api.dto.ClubCreateResponseDTO;
import com.taiso.bike_api.service.NewClubService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@Slf4j
@RequestMapping("/api/clubs")
@Tag(name = "클럽 생성 컨트롤러", description = "클럽 생성 API")
public class NewClubController {

    @Autowired
    private NewClubService newClubService;

    @Operation(summary = "클럽 생성", description = "클럽을 생성하는 API")
    @PostMapping("")
    public ResponseEntity<ClubCreateResponseDTO> createClub(
            @RequestPart(value = "clubData") ClubCreateRequestDTO requestDTO
            , @RequestPart(value = "clubProfileImage", required = false) MultipartFile clubProfileImage
            , Authentication authentication) {

        log.info("로직 시작 : {}", requestDTO.toString());
        log.info("clubProfileImage : {}",clubProfileImage.getOriginalFilename());

        newClubService.createClub(requestDTO, authentication, clubProfileImage);

        return ResponseEntity.status(HttpStatus.CREATED).body(null);
    }

    @Operation(summary = "클럽 삭제", description = "오직 리더만 클럽을 삭제하는 API")
    @DeleteMapping("/{clubId}")
    public ResponseEntity<ClubCreateResponseDTO> deleteClub(
            @PathVariable(name = "clubId") Long clubId
            , Authentication authentication) {

        log.info("로직 시작시 들어온 clubId : {}", clubId);

        newClubService.deleteClub(clubId, authentication);

        return ResponseEntity.status(HttpStatus.CREATED).body(null);
    }

}
