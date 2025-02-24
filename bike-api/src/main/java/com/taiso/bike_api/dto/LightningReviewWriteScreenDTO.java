package com.taiso.bike_api.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LightningReviewWriteScreenDTO {
    private Long lightningId;
    private Long userId;              // 참여 회원의 사용자 ID
    private String participantStatus; // 참여 상태 (예: "완료")
    private String role;              // 역할 (예: "참여자")
    private ReviewedUserDetailDTO userDetail; // 회원 상세 정보
}
