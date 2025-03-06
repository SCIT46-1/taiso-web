package com.taiso.bike_api.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.taiso.bike_api.dto.ClubDescriptionUpdateRequestDTO;
import com.taiso.bike_api.dto.ClubDescriptionUpdateResponseDTO;
import com.taiso.bike_api.dto.ClubDetailGetResponseDTO;
import com.taiso.bike_api.dto.ClubsGetResponseDTO;
import com.taiso.bike_api.service.ClubService;


@RestController
@RequestMapping("/api/clubs")
public class ClubController {

    @Autowired
    private ClubService clubService;
    
    @GetMapping("/{clubId}")
    public ResponseEntity<ClubDetailGetResponseDTO> getClubDetail(@PathVariable(name = "clubId") Long clubId) {
        return ResponseEntity.status(HttpStatus.OK).body(clubService.getClubDetail(clubId));
    }

    @GetMapping("")
    public ResponseEntity<List<ClubsGetResponseDTO>> getClubs() {
        return ResponseEntity.status(HttpStatus.OK).body(clubService.getClubs());
    }

    @PatchMapping("/{clubId}/description")
    public ResponseEntity<ClubDescriptionUpdateResponseDTO> updateClubDescription(
        @PathVariable(name = "clubId") Long clubId
        , @RequestBody ClubDescriptionUpdateRequestDTO requestDTO
        , Authentication authentication) {
        return ResponseEntity.status(HttpStatus.OK).body(clubService.updateClubDescription(clubId, requestDTO, authentication));
    }

}
