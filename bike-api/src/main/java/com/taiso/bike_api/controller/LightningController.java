package com.taiso.bike_api.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.taiso.bike_api.dto.LightingParticipationCheckResponseDTO;
import com.taiso.bike_api.dto.LightningGetRequestDTO;
import com.taiso.bike_api.dto.LightningGetResponseDTO;
import com.taiso.bike_api.dto.LightningPostRequestDTO;
import com.taiso.bike_api.dto.LightningPostResponseDTO;
import com.taiso.bike_api.service.LightningService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;

@RestController
@Slf4j
@RequestMapping("/api/lightnings")
@Tag(name = "번개 컨트롤러", description = "번개 관련 API")
public class LightningController {

    @Autowired
    LightningService lightningService;

    @PostMapping("")
    @Operation(summary = "번개 생성", description = "번개 생성 API")
    public ResponseEntity<LightningPostResponseDTO> createLighting(
        @RequestBody LightningPostRequestDTO requestDTO,
        @AuthenticationPrincipal String userEmail) {
        return ResponseEntity.status(HttpStatus.ACCEPTED)
                             .body(lightningService.createLightning(requestDTO, userEmail));
    }

    @GetMapping("")
    @Operation(summary = "번개 리스트 조회", description = "번개 리스트 조회 API")
    public ResponseEntity<LightningGetResponseDTO> getLightning(
        @RequestParam(name = "page", defaultValue = "0") int page,
        @RequestParam(name = "size", defaultValue = "10") int size,
        @ModelAttribute LightningGetRequestDTO requestDTO) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt,DESC".split(",")[0]).descending());
        return ResponseEntity.status(HttpStatus.OK)
                             .body(lightningService.getLightning(requestDTO, pageable));
    }

    @GetMapping("/{lightningId}/participation")
    @Operation(summary = "번개 참가 확인", description = "번개 참가 확인 API")
    public ResponseEntity<LightingParticipationCheckResponseDTO> getLightningParticipationCheck(
        @PathVariable(name = "lightningId") Long lightningId,
        @AuthenticationPrincipal String userEmail) {
        return ResponseEntity.status(HttpStatus.OK)
                             .body(lightningService.getParticipationCheck(lightningId, userEmail));
    }
}