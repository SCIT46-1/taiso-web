package com.taiso.bike_api.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class UserReviewResponseDTO {

    private Long reviewId;

    // 고유 아이디
    private Long reviewed;
    private Long reviewer;

    // 닉네임&프사 (출력용)
    private String reviewedNickname;
    private String reviewerNickname;
    private String reviewerProfileImg;

    // 리뷰 내용
    private String reviewContent;
    private String reviewTag;

    // 날짜
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // 연결된 번개
    private Long lightningId;

}
