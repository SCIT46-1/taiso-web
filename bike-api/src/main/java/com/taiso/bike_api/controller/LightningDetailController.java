package com.taiso.bike_api.controller;

import com.taiso.bike_api.dto.LightningDetailGetResponseDTO;
import com.taiso.bike_api.dto.LightningDetailUpdateGetResponseDTO;
import com.taiso.bike_api.dto.LightningDetailUpdateRequestDTO;
import com.taiso.bike_api.dto.LightningDetailUpdateResponseDTO;
import com.taiso.bike_api.service.LightningDetailService;
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
@RequestMapping("/api/lightnings")
@Tag(name = "번개 디테일 컨트롤러", description = "번개 디테일 조회&수정 API")
public class LightningDetailController {

    @Autowired
    private LightningDetailService lightningDetailService;

    @Operation(summary = "번개 디테일 조회", description = "특정 번개 상세 페이지 조회 API")
    @GetMapping("/{lightning}")
    public ResponseEntity<LightningDetailGetResponseDTO> getLightningDetail (@PathVariable("lightning") Long lightningId) {

        LightningDetailGetResponseDTO lightningDetailGetResponseDTO = lightningDetailService.getLightningDetail(lightningId);

        return ResponseEntity.status(HttpStatus.CREATED).body(lightningDetailGetResponseDTO);
    }

    @Operation(summary = "번개 디테일 수정 화면 조회", description = "특정 번개 상세 수정 화면 조회 API")
    @GetMapping("/{lightning}/update")
    public ResponseEntity<LightningDetailUpdateGetResponseDTO> getUpdateLightningDetail (
                                        @PathVariable("lightning") Long lightningId,
                                        Authentication authentication) {

        LightningDetailUpdateGetResponseDTO lightningDetailUpdateGetResponseDTO = lightningDetailService.getUpdateLightningDetail(lightningId, authentication);

        return ResponseEntity.status(HttpStatus.CREATED).body(lightningDetailUpdateGetResponseDTO);
    }

    @Operation(summary = "번개 디테일 수정", description = "특정 번개 상세 수정 API")
    @PostMapping("/{lightning}")
    public ResponseEntity<LightningDetailUpdateResponseDTO> updateLightningDetail (
            @RequestBody LightningDetailUpdateRequestDTO lightningDetailUpdateRequestDTO,
            Authentication authentication) {

        lightningDetailService.updateLightningDetail(lightningDetailUpdateRequestDTO, authentication);

        return ResponseEntity.status(HttpStatus.CREATED).body(null);
    }


}
