package com.taiso.bike_api.dto;

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
public class LightningCompletedReviewsResponseDTO {

	// 리뷰 아이디 UserReviewEntity
    private Long reviewId;
    // 리뷰 한 사람 아이디
	private Long reviewer;
	// 리뷰 받은사람 아이디
    private Long reviewed;
	
	// 닉네임&프사 (출력용) UserDetailEntity
	private LightningCompletedReviewsUserDetailDTO userDetailDTO;

    // lightningUserEntity 역할, 상태, 아이디
	private LightningCompletedReviewsLightningUserDTO lightningUserDTO;
    
    // 리뷰 작성 여부
    private Boolean isReviewed;
}
