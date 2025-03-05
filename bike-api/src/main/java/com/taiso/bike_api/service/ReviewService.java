package com.taiso.bike_api.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import com.taiso.bike_api.domain.LightningEntity;
import com.taiso.bike_api.domain.LightningEntity.LightningStatus;
import com.taiso.bike_api.domain.LightningUserEntity;
import com.taiso.bike_api.domain.UserDetailEntity;
import com.taiso.bike_api.domain.UserEntity;
import com.taiso.bike_api.domain.UserReviewEntity;
import com.taiso.bike_api.dto.LightningCompletedReviewsLightningUserDTO;
import com.taiso.bike_api.dto.LightningCompletedReviewsResponseDTO;
import com.taiso.bike_api.dto.LightningCompletedReviewsUserDetailDTO;
import com.taiso.bike_api.dto.UserReviewRequestDTO;
import com.taiso.bike_api.exception.LightningNotFoundException;
import com.taiso.bike_api.exception.LightningStatusMismatchException;
import com.taiso.bike_api.exception.LightningUserReviewMismatchException;
import com.taiso.bike_api.exception.ReviewNotFoundException;
import com.taiso.bike_api.exception.UserNotFoundException;
import com.taiso.bike_api.repository.LightningRepository;
import com.taiso.bike_api.repository.LightningUserRepository;
import com.taiso.bike_api.repository.UserDetailRepository;
import com.taiso.bike_api.repository.UserRepository;
import com.taiso.bike_api.repository.UserReviewRepository;

import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class ReviewService {

	@Autowired
	private LightningRepository lightningRepository;	

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private UserReviewRepository userReviewRepository;

	@Autowired
	private UserDetailRepository userDetailRepository;

	@Autowired
	private LightningUserRepository lightningUserRepository;

	// 리뷰 입력 서비스
    @Transactional
	public void createReview(Long lightningId, Long userId, Authentication authentication, 
			UserReviewRequestDTO userReviewRequest) {

    	// 1. 번개 이벤트 조회 (존재하지 않으면 404)
    	LightningEntity lightningEntity = lightningRepository.findById(lightningId)
    			// 예외처리 -> 404
                .orElseThrow(() -> new LightningNotFoundException("번개를 찾을 수 없습니다."));	
    	
    	UserEntity reviewer = userRepository.findByEmail(authentication.getName())
        		// 사용자 찾을 수 없음 -> 404
                .orElseThrow(() -> new UserNotFoundException("현재 리뷰 입력 사용자를 찾을 수 없습니다."));
    	
    	// 2. 현재 로그인한 사용자 (리뷰 작성자) 조회
    	UserDetailEntity reviewerDetail = userDetailRepository.findById(reviewer.getUserId())
        		// 사용자 찾을 수 없음 -> 404
                .orElseThrow(() -> new UserNotFoundException("현재 리뷰 입력 사용자를 찾을 수 없습니다.")); 

        
        // 3. 리뷰 대상(리뷰 받는 사용자) 조회
        UserDetailEntity reviewedUser = userDetailRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("리뷰 대상 사용자를 찾을 수 없습니다."));
        
        // 4. 자신을 리뷰할 수 없어야 함
        if(reviewer.getUserId().equals(reviewedUser.getUserId())) {
            throw new LightningUserReviewMismatchException("자기 자신을 리뷰할 수 없음");
        }
        
        // 5. 번개 이벤트에 이미 해당 리뷰 대상에 대한 리뷰가 있는지 체크
        Optional<LightningUserEntity> participant = lightningUserRepository
                .findByLightningAndUser(lightningEntity, reviewedUser.getUser());
        if (participant.isEmpty()) {
            throw new LightningUserReviewMismatchException("리뷰 대상 사용자가 해당 번개 이벤트에 참여하지 않았습니다.");
        }
        
        // 6. 번개가 종료 됐을 때만 리뷰를 작성할 수 있음 (LightningStatus)
        if (lightningEntity.getStatus() != LightningStatus.종료) {
            throw new LightningStatusMismatchException("리뷰 대상이 종료가 되지 않은 번개입니다.");
        }
        
        // 7. UserReviewEntity 생성 및 저장
        UserReviewEntity review = UserReviewEntity.builder()
                .lightning(lightningEntity)
                .reviewer(reviewerDetail)
                .reviewed(reviewedUser)
                .reviewContent(userReviewRequest.getReviewContent())
                .reviewTag(userReviewRequest.getReviewTag())
                .build();
        
        userReviewRepository.save(review);
        
	}
    
    // 리뷰 삭제 서비스
    @Transactional
	public void deleteReview(Long lightningId, Long userId, Authentication authentication) {

    	// 1. 번개 이벤트 조회 (존재하지 않으면 404)
//    	LightningEntity lightningEntity = lightningRepository.findById(lightningId)
//                .orElseThrow(() -> new LightningNotFoundException("번개를 찾을 수 없습니다."));	
    	if (!lightningRepository.existsById(lightningId)) {
    	    throw new LightningNotFoundException("번개를 찾을 수 없습니다. lightningId: " + lightningId);
    	}
    	
    	// 2. 현재 로그인한 사용자 (리뷰 작성자) 조회
        UserEntity reviewerEntity = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new UserNotFoundException("사용자를 찾을 수 없습니다.")); 
        // 유저 디테일 entity
    	UserDetailEntity reviewer = userDetailRepository.findById(reviewerEntity.getUserId())
                .orElseThrow(() -> new UserNotFoundException("현재 리뷰 입력 사용자를 찾을 수 없습니다.")); 
        
        // 3. 리뷰 대상(리뷰 받는 사용자) 조회
        UserEntity reviewedUserEntity = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("리뷰 대상 사용자를 찾을 수 없습니다."));
        // 유저 디테일 entity
    	UserDetailEntity reviewedUser = userDetailRepository.findById(reviewedUserEntity.getUserId())
                .orElseThrow(() -> new UserNotFoundException("현재 리뷰 입력 사용자를 찾을 수 없습니다.")); 
        
        // 4. 번개 리뷰 조회
        UserReviewEntity userReviewEntity = userReviewRepository.findByReviewerAndReviewed(reviewer, reviewedUser)
                .orElseThrow(() -> new ReviewNotFoundException("번개 리뷰를 찾을 수 없습니다. reviewer: "));
        
        // 5. 로그인한 사용자가 리뷰의 주인인지 조회
        if(!reviewer.getUserId().equals(userReviewEntity.getReviewer().getUserId())) {
            throw new LightningUserReviewMismatchException("번개와 참가 신청하는 유저가 일치하지 않음");
        }
		
        // 6. 로그인한 사용자가 리뷰 작성자인지 추가 검증 (이미 조회 조건에 포함되어 있으므로 중복 검증일 수 있음)
        if (!reviewer.getUserId().equals(userReviewEntity.getReviewer().getUserId())) {
            throw new LightningUserReviewMismatchException("리뷰 작성자와 로그인 사용자가 일치하지 않습니다.");
        }
        
        // 7. 번개 리뷰 삭제
        userReviewRepository.delete(userReviewEntity);
	}

    
    
	// 내 완료 번개 참여회원 리뷰 작성화면 서비스
    @Transactional
	public List<LightningCompletedReviewsResponseDTO> completedReviews(Long lightningId, Authentication authentication) {

    	// 1. 현재 로그인한 사용자 (리뷰 작성자) 조회
    	Optional<UserEntity> optionalUser = userRepository.findByEmail(authentication.getName());
    	if (optionalUser.isEmpty()) {
    	    throw new UserNotFoundException("사용자를 찾을 수 없습니다.");
    	}
    	
    	// 2. 번개 이벤트 조회 (존재하지 않으면 404)
    	LightningEntity lightningEntity = lightningRepository.findById(lightningId)
                .orElseThrow(() -> new LightningNotFoundException("번개를 찾을 수 없습니다."));	
    	
    	// 3. 번개로 리뷰 조회
    	List<UserReviewEntity> reviewEntities = userReviewRepository.findByLightning_LightningId(lightningId);
    	log.info("responseDTOs ===== {}",reviewEntities);
    	
    	// 4. LightningCompletedReviewsResponseDTO 리스트로 매핑
    	List<LightningCompletedReviewsResponseDTO> responseDTOs = reviewEntities.stream()
    			.map((UserReviewEntity review) -> {
    		        // 리뷰 받는 사용자(UserEntity)로부터 필요한 정보를 DTO로 매핑
    		        LightningCompletedReviewsUserDetailDTO userDetailDTO = LightningCompletedReviewsUserDetailDTO.builder()
    		            .userId(review.getReviewed().getUserId())
    		            .reviewedNickname(review.getReviewed().getUserNickname())
    		            .reviewedProfileImg(review.getReviewed().getUserProfileImg())
    		            .build();

    		        // 해당 번개 이벤트와 리뷰 받는 사용자에 대한 참가 정보(LightningUserEntity)를 조회
    		        Optional<LightningUserEntity> optionalLightningUserEntity = 
    		            lightningUserRepository.findByLightningAndUser(lightningEntity, review.getReviewed().getUser());
    		        
    		        // lightningUserDTO 매핑
    		        LightningCompletedReviewsLightningUserDTO lightningUserDTO = null;
    		        if (optionalLightningUserEntity.isPresent()) {
    		            LightningUserEntity lue = optionalLightningUserEntity.get();
    		            lightningUserDTO = LightningCompletedReviewsLightningUserDTO.builder()
    		                .lightning(lightningEntity.getLightningId())
    		                .role(lue.getRole())
    		                .participantStatus(lue.getParticipantStatus())
    		                .build();
    		        }
    		        
    		        // LightningCompletedReviewsResponseDTO 매핑
    		        return LightningCompletedReviewsResponseDTO.builder()
    		            .reviewId(review.getReviewId())
    		            .reviewer(review.getReviewer().getUserId())
    		            .reviewed(review.getReviewed().getUserId())
    		            .userDetailDTO(userDetailDTO)
    		            .lightningUserDTO(lightningUserDTO)
    		            .build();
    			})
                .collect(Collectors.toList());
    	
    	log.info("responseDTOs ===== {}",responseDTOs);
    	return responseDTOs;
        
        
	}

}
