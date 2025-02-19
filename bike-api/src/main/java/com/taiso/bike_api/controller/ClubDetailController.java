package com.taiso.bike_api.controller;

import com.taiso.bike_api.dto.ApiResponseDto;
import com.taiso.bike_api.dto.ClubDetailResponseDTO;
import com.taiso.bike_api.service.ClubService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/clubs")
public class ClubDetailController {

    private final ClubService clubService;

    @Autowired
    public ClubDetailController(ClubService clubService) {
        this.clubService = clubService;
    }

    @GetMapping("/{clubId}")
    public ResponseEntity<?> getClubDetail(@PathVariable("clubId") Long clubId) {
        try {
            ClubDetailResponseDTO responseDto = clubService.getClubDetail(clubId);
            return ResponseEntity.status(HttpStatus.OK).body(responseDto);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponseDto("요청 형식이 올바르지 않습니다."));
        }
    }
}
