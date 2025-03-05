package com.taiso.bike_api.dto;

import java.time.LocalDateTime;

import com.taiso.bike_api.domain.UserReviewEntity.ReviewTag;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@Builder
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class UserLightningReviewResponseDTO {

	// 리뷰 아이디
    private Long reviewId;
    // 리뷰 한 사람 아이디
	private Long reviewer;
	// 리뷰 받은사람 아이디
    private Long reviewed;
    // 번개 아이디
	private Long lightningId;
	
    // 리뷰 내용
    private String reviewContent;
	// 리뷰 태그
    private ReviewTag reviewTag;
    private LocalDateTime createdAt;
    
	// 닉네임&프사 (출력용)
    private String reviewedNickname;
    private String reviewerNickname;
    private String reviewerProfileImg;
    private String reviewedProfileImg;
    
    
	
	
}
