package com.taiso.bike_api.controller;

import com.taiso.bike_api.dto.LightningResponseDTO;
import com.taiso.bike_api.security.JwtTokenProvider;
import com.taiso.bike_api.service.LightningService;

import java.util.Collections;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/users/me/lightings")
public class LightningUserController {

    @Autowired
    LightningService lightningService;

    @GetMapping
    public ResponseEntity<?> getUserLightningEvents(
            @RequestParam("status") int status,
            Authentication authentication) {

        // 인증 객체가 null이면 인증이 되지 않은 것으로 간주
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Collections.singletonMap("message", "토큰이 존재하지 않습니다."));
        }

        // Authentication 객체에서 사용자 식별자(예: 이메일) 추출
        String email = authentication.getName();

        List<LightningResponseDTO> lightningEvents;
        try {
            lightningEvents = lightningService.getUserLightningEvents(email, status);
            if (lightningEvents == null || lightningEvents.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Collections.singletonMap("message", "아무런 번개가 존재하지 않습니다."));
            }
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("message", e.getMessage()));
        }

        return ResponseEntity.status(HttpStatus.OK).body(lightningEvents);
    }
}
