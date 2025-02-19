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
public class ClubJoinRejectResponseDTO {
    private Long clubId;
    private Long userId;
    private String userNickname;
    private String participantStatus;
    private String role;
    private LocalDateTime joinedAt;
    private String message;
}
