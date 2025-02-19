package com.taiso.bike_api.controller;

import com.taiso.bike_api.dto.ApiResponseDto;
import com.taiso.bike_api.dto.LightningResponseDTO;
import com.taiso.bike_api.security.JwtTokenProvider;
import com.taiso.bike_api.service.LightningService;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/users/me/lightings")
public class LightningUserController {

    private final LightningService lightningService;
    private final JwtTokenProvider jwtTokenProvider;

    @Autowired
    public LightningUserController(LightningService lightningService,
                                   JwtTokenProvider jwtTokenProvider) {
        this.lightningService = lightningService;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @GetMapping
    public ResponseEntity<?> getUserLightningEvents(@RequestParam("status") int status,
                                                    HttpServletRequest request) {
        // 1. JWT 토큰 추출
        String token = request.getHeader("Authorization");
        if (token == null || token.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponseDto("토큰이 존재하지 않습니다."));
        }
        // 2. JWT 토큰 검증
        if (!jwtTokenProvider.validateToken(token)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ApiResponseDto("만료되거나 올바르지 않은 토큰 입니다."));
        }
        // 3. 토큰에서 사용자 식별자(이메일) 추출
        String email = jwtTokenProvider.getUsernameFromJWT(token);

        // 4. 서비스 호출하여 사용자와 연관된 번개 이벤트 목록 조회
        List<LightningResponseDTO> lightningEvents;
        try {
            lightningEvents = lightningService.getUserLightningEvents(email, status);
            if (lightningEvents == null || lightningEvents.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ApiResponseDto("아무런 번개가 존재하지 않습니다."));
            }
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponseDto(e.getMessage()));
        }
        // 5. 조회 결과 응답 (200 OK)
        return ResponseEntity.status(HttpStatus.OK).body(lightningEvents);
    }
}
