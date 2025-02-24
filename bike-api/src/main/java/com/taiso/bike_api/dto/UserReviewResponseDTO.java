package com.taiso.bike_api.dto;

import java.time.LocalDateTime;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserReviewResponseDTO {
    private Long lightningId;
    private Long reviewId;
    private Long reviewerId;
    private Long reviewedId;
    private String reviewContent;
    private LocalDateTime reviewDate;  // 생성 시각(생성일)
    private String reviewTag;
    private ReviewedUserDetailDTO reviewedUserDetail;
}
