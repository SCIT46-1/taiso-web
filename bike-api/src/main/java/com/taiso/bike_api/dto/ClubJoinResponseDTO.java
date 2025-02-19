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
public class ClubJoinResponseDTO {
    private Long clubId;
    private Long userId;
    private String clubName;
    private LocalDateTime joinedAt;
    private String message;
}
