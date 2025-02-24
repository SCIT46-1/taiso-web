package com.taiso.bike_api.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LightningJoinAcceptResponseDTO {
    private Long lightningId;
    private String title;
    private Long userId;
    private String username;
    private String message;
    private LocalDateTime joinedAt;
}
