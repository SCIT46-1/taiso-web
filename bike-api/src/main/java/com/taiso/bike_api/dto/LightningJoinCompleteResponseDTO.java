package com.taiso.bike_api.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class LightningJoinCompleteResponseDTO {
    
    private Long lightningId;

    private LocalDateTime eventDate;

    private Integer duration;

    private BigDecimal latitude;

    private BigDecimal longitude;
    
    private Integer capacity;

    private Integer currentParticipants;

    private String routeTitle;

    private LocalDateTime joinDate;

}

