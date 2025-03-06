package com.taiso.bike_api.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class KakaoAuthResultDTO {
    private String jwtToken;
    private Long userId;
    private String userEmail;
    private String userNickname;
} 