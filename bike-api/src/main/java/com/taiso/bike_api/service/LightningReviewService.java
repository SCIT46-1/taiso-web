package com.taiso.bike_api.service;

import com.taiso.bike_api.domain.LightningEntity;
import com.taiso.bike_api.domain.LightningUserEntity;
import com.taiso.bike_api.domain.UserDetailEntity;
import com.taiso.bike_api.domain.UserReviewEntity;
import com.taiso.bike_api.dto.LightningReviewWriteScreenDTO;
import com.taiso.bike_api.dto.ReviewedUserDetailDTO;
import com.taiso.bike_api.repository.LightningRepository;
import com.taiso.bike_api.repository.LightningUserRepository;
import com.taiso.bike_api.repository.UserReviewRepository;
import com.taiso.bike_api.repository.UserRepository;
import com.taiso.bike_api.repository.UserDetailRepository;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class LightningReviewService {

    private final LightningRepository lightningRepository;
    private final LightningUserRepository lightningUserRepository;
    private final UserReviewRepository userReviewRepository;
    private final UserRepository userRepository;
    private final UserDetailRepository userDetailRepository;

    @Autowired
    public LightningReviewService(LightningRepository lightningRepository,
                                  LightningUserRepository lightningUserRepository,
                                  UserReviewRepository userReviewRepository,
                                  UserRepository userRepository,
                                  UserDetailRepository userDetailRepository) {
        this.lightningRepository = lightningRepository;
        this.lightningUserRepository = lightningUserRepository;
        this.userReviewRepository = userReviewRepository;
        this.userRepository = userRepository;
        this.userDetailRepository = userDetailRepository;
    }

    public List<LightningReviewWriteScreenDTO> getReviewWriteScreen(Long lightningId, String reviewerEmail) {
        // 1. 번개 이벤트 조회
        LightningEntity lightning = lightningRepository.findById(lightningId)
                .orElseThrow(() -> new IllegalArgumentException("아무런 번개가 존재하지 않습니다."));

        // 2. 현재 사용자(리뷰어) 조회
        Long reviewerId = userRepository.findByEmail(reviewerEmail)
                .orElseThrow(() -> new IllegalArgumentException("리뷰어 정보를 찾을 수 없습니다."))
                .getUserId();

        // 3. 해당 번개 이벤트의 참여 회원 조회
        List<LightningUserEntity> participants = lightningUserRepository.findByLightning_LightningId(lightningId);
        if (participants.isEmpty()) {
            throw new IllegalArgumentException("아무런 번개가 존재하지 않습니다.");
        }

        // 4. 리뷰 미작성 참여 회원 필터링: 현재 리뷰어가 아직 리뷰를 작성하지 않은 회원만 선택
        List<LightningReviewWriteScreenDTO> dtos = participants.stream()
                .filter(lu -> {
                    // 리뷰 대상은 현재 사용자가 아니고, 참여 상태가 "완료"인 회원만 포함
                    return !lu.getUser().getUserId().equals(reviewerId)
                            && lu.getParticipantStatus().toString().equals("완료");
                })
                .filter(lu -> {
                    // 현재 리뷰어가 해당 회원에 대해 이미 리뷰를 작성했는지 확인
                    Optional<UserReviewEntity> reviewOpt = userReviewRepository.findByLightning_LightningIdAndReviewer_UserIdAndReviewed_UserId(
                            lightningId, reviewerId, lu.getUser().getUserId());
                    return !reviewOpt.isPresent();
                })
                .map(lu -> {
                    // 각 참여 회원의 상세 정보를 조회 (UserDetailEntity)
                    UserDetailEntity detail = userDetailRepository.findById(lu.getUser().getUserId()).orElse(null);
                    ReviewedUserDetailDTO userDetailDTO = null;
                    if (detail != null) {
                        userDetailDTO = ReviewedUserDetailDTO.builder()
                                .userId(detail.getUserId())
                                .userNickname(detail.getUserNickname())
                                .userProfileImg(detail.getUserProfileImg())
                                .build();
                    }
                    return LightningReviewWriteScreenDTO.builder()
                            .lightningId(lightning.getLightningId())
                            .userId(lu.getUser().getUserId())
                            .participantStatus(lu.getParticipantStatus().toString())
                            .role(lu.getRole().toString())
                            .userDetail(userDetailDTO)
                            .build();
                })
                .collect(Collectors.toList());

        if (dtos.isEmpty()) {
            throw new IllegalArgumentException("리뷰를 작성할 회원이 존재하지 않습니다.");
        }
        return dtos;
    }
}
