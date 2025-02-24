package com.taiso.bike_api.service;

import com.taiso.bike_api.domain.UserReviewEntity;
import com.taiso.bike_api.domain.UserDetailEntity;
import com.taiso.bike_api.dto.ReviewedUserDetailDTO;
import com.taiso.bike_api.dto.UserReviewResponseDTO;
import com.taiso.bike_api.repository.UserReviewRepository;
import com.taiso.bike_api.repository.UserDetailRepository;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserReviewService {

    private final UserReviewRepository userReviewRepository;
    private final UserDetailRepository userDetailRepository;

    @Autowired
    public UserReviewService(UserReviewRepository userReviewRepository,
                             UserDetailRepository userDetailRepository) {
        this.userReviewRepository = userReviewRepository;
        this.userDetailRepository = userDetailRepository;
    }

    public List<UserReviewResponseDTO> getUserReviews(Long reviewedId, Long lightningId) {
        List<UserReviewEntity> reviews = userReviewRepository
                .findByReviewed_UserIdAndLightning_LightningId(reviewedId, lightningId);

        if (reviews.isEmpty()) {
            throw new IllegalArgumentException("해당 리뷰가 존재하지 않습니다.");
        }

        return reviews.stream().map(review -> {
            // 리뷰 대상자 상세 정보 조회
            UserDetailEntity userDetail = userDetailRepository.findById(review.getReviewed().getUserId())
                    .orElse(null);
            ReviewedUserDetailDTO reviewedUserDetail = null;
            if (userDetail != null) {
                reviewedUserDetail = com.taiso.bike_api.dto.ReviewedUserDetailDTO.builder()
                        .userId(userDetail.getUserId())
                        .userProfileImg(userDetail.getUserProfileImg())
                        .userNickname(userDetail.getUserNickname())
                        .build();
            }

            return UserReviewResponseDTO.builder()
                    .lightningId(review.getLightning().getLightningId())
                    .reviewId(review.getReviewId())
                    .reviewerId(review.getReviewer().getUserId())
                    .reviewedId(review.getReviewed().getUserId())
                    .reviewContent(review.getReviewContent())
                    .reviewDate(review.getCreatedAt())
                    .reviewTag(review.getReviewTag().toString())
                    .reviewedUserDetail(reviewedUserDetail)
                    .build();
        }).collect(Collectors.toList());
    }
}
