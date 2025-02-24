package com.taiso.bike_api.service;

import com.taiso.bike_api.domain.LightningEntity;
import com.taiso.bike_api.domain.UserEntity;
import com.taiso.bike_api.domain.UserReviewEntity;
import com.taiso.bike_api.domain.UserReviewEntity.ReviewTag;
import com.taiso.bike_api.dto.UserReviewRequestDTO;
import com.taiso.bike_api.repository.LightningRepository;
import com.taiso.bike_api.repository.UserRepository;
import com.taiso.bike_api.repository.UserReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserReviewService {

    private final LightningRepository lightningRepository;
    private final UserRepository userRepository;
    private final UserReviewRepository userReviewRepository;

    @Autowired
    public UserReviewService(LightningRepository lightningRepository,
                             UserRepository userRepository,
                             UserReviewRepository userReviewRepository) {
        this.lightningRepository = lightningRepository;
        this.userRepository = userRepository;
        this.userReviewRepository = userReviewRepository;
    }

    public void createReview(Long lightningId, Long reviewedId, String reviewerEmail, UserReviewRequestDTO requestDto) {
        // 1. 번개 이벤트 조회
        LightningEntity lightning = lightningRepository.findById(lightningId)
                .orElseThrow(() -> new IllegalArgumentException("아무런 번개가 존재하지 않습니다."));

        // 2. 리뷰어(현재 사용자) 조회
        UserEntity reviewer = userRepository.findByEmail(reviewerEmail)
                .orElseThrow(() -> new IllegalArgumentException("리뷰어 정보가 존재하지 않습니다."));

        // 3. 리뷰 대상자 조회
        UserEntity reviewed = userRepository.findById(reviewedId)
                .orElseThrow(() -> new IllegalArgumentException("리뷰 대상 사용자 정보가 존재하지 않습니다."));

        // 4. 리뷰 태그 변환 (대소문자 구분 없이 변환)
        ReviewTag reviewTag;
        try {
            reviewTag = ReviewTag.valueOf(requestDto.getReviewTag().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("유효하지 않은 리뷰 태그입니다.");
        }

        // 5. 리뷰 엔티티 생성 및 저장
        UserReviewEntity review = UserReviewEntity.builder()
                .reviewContent(requestDto.getReviewContent())
                .reviewer(reviewer)
                .reviewed(reviewed)
                .lightning(lightning)
                .reviewTag(reviewTag)
                .build();

        userReviewRepository.save(review);
    }
}
