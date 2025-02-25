package com.taiso.bike_api.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
@ToString
@Builder
public class LightingParticipationCheckResponseDTO {
    private Long lightningId;

    private String title;

    private LocalDateTime eventDate;

    private Integer duration;

    private BigDecimal latitude;

    private BigDecimal longitude;
}
