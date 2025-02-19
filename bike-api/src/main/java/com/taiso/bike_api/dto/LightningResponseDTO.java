package com.taiso.bike_api.dto;

import java.time.LocalDateTime;
import java.util.List;
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
public class LightningResponseDTO {
    private Long lightningId;
    private String title;
    private Long creatorId;
    private String status; // 모집, 마감, 종료 등 (문자열 형태)
    private LocalDateTime eventDate;
    private Integer duration;
    private Integer capacity;
    private String address;
    private List<LightningUserDTO> lightningUsers;
    private List<LightningTagDTO> tags;
}
