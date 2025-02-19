package com.taiso.bike_api.dto;

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
public class ClubInfoUpdateResponseDTO {
    private Long clubId;
    private String clubDescription;
    // 수정 요청을 수행한 관리자(어드민)의 userId
    private Long userId;
    private String message;
}
