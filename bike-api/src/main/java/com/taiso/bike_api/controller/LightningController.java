package com.taiso.bike_api.controller;
import java.util.Collections;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;

import com.taiso.bike_api.dto.LightningGetRequestDTO;
import com.taiso.bike_api.dto.LightningGetResponseDTO;
import com.taiso.bike_api.dto.LightningRequestDTO;
import com.taiso.bike_api.dto.LightningResponseDTO;
import com.taiso.bike_api.service.LightningService;
import com.taiso.bike_api.dto.LightningJoinAcceptResponseDTO;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;


@RestController
@Slf4j
@RequestMapping("/api/lightning")
@Tag(name = "번개 컨트롤러", description = "번개 관련 API")
public class LightningController {

    @Autowired
    LightningService lightningService;
    
    @PostMapping("")
    @Operation(summary = "번개 생성", description = "번개 생성 API")
    public ResponseEntity<LightningResponseDTO> createLighting(
        @RequestBody LightningRequestDTO requestDTO
        , @AuthenticationPrincipal String userEmail) {

        LightningResponseDTO responseDTO = lightningService.createLightning(requestDTO, userEmail);

        return ResponseEntity.status(HttpStatus.ACCEPTED).body(responseDTO);
    }

    @GetMapping("")
    @Operation(summary = "번개 리스트 조회", description = "번개 리스트 조회 API")
    //TODO 필터 기능의 reqeust값은 쿼리 파라미터로 변경
    public ResponseEntity<LightningGetResponseDTO> getLightning(@RequestBody LightningGetRequestDTO requestDTO) {

        LightningGetResponseDTO responseDTO = lightningService.getLightning(requestDTO);
        
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(responseDTO);
    }

    // 번개 참가 수락
    @PatchMapping("/join-requests/{lightningId}/{userId}")
    @Operation(summary = "번개 참가 수락", description = "번개 이벤트 생성자(또는 관리자)가 특정 사용자의 참가 신청을 수락합니다.")
    public ResponseEntity<?> acceptJoinRequest(
            @PathVariable("lightningId") Long lightningId,
            @PathVariable("userId") Long userId,
            Authentication authentication) {

        // SecurityFilterChain에서 인증된 사용자 정보를 Authentication 객체로 주입받습니다.
        String requesterEmail = authentication.getName();

        try {
            LightningJoinAcceptResponseDTO responseDto =
                    lightningService.acceptJoinRequest(lightningId, userId, requesterEmail);
            return ResponseEntity.status(HttpStatus.CREATED).body(responseDto);
        } catch (IllegalArgumentException e) {
            String errorMsg = e.getMessage();
            if ("해당 사용자의 참가 신청이 존재하지 않습니다.".equals(errorMsg)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Collections.singletonMap("message", errorMsg));
            } else if ("해당 사용자는 이미 모임에 승인되었습니다.".equals(errorMsg)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Collections.singletonMap("message", errorMsg));
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Collections.singletonMap("message", errorMsg));
            }
        }
    }
    
}
