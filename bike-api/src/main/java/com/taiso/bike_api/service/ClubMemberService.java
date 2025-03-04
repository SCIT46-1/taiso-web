package com.taiso.bike_api.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import com.taiso.bike_api.domain.ClubEntity;
import com.taiso.bike_api.domain.ClubMemberEntity;
import com.taiso.bike_api.domain.LightningUserEntity;
import com.taiso.bike_api.domain.ClubMemberEntity.ParticipantStatus;
import com.taiso.bike_api.domain.ClubMemberEntity.Role;
import com.taiso.bike_api.domain.UserEntity;
import com.taiso.bike_api.exception.ClubLeaderMismatchException;
import com.taiso.bike_api.exception.ClubMemberAlreadyExistsException;
import com.taiso.bike_api.exception.ClubMemberFullException;
import com.taiso.bike_api.exception.ClubMemberMismatchException;
import com.taiso.bike_api.exception.ClubNotFoundException;
import com.taiso.bike_api.exception.ClubStatusMismatchException;
import com.taiso.bike_api.exception.LightningCreatorMismatchException;
import com.taiso.bike_api.exception.LightningUserMismatchException;
import com.taiso.bike_api.exception.LightningUserStatusNotPendingException;
import com.taiso.bike_api.exception.UserNotFoundException;
import com.taiso.bike_api.repository.ClubMemberRepository;
import com.taiso.bike_api.repository.ClubRepository;
import com.taiso.bike_api.repository.UserRepository;

import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class ClubMemberService {

	@Autowired
	private ClubRepository clubRepository;
    
    @Autowired
    private UserRepository userRepository;

	@Autowired
	private ClubMemberRepository clubMemberRepository;
	
	// 클럽 가입 신청 서비스
	@Transactional
	public void joinClubMember(Long clubId, Authentication authentication) {
		
		// 1. 클럽 아이디로 엔티티 가져오기 
        ClubEntity clubEntity = clubRepository.findById(clubId)
                .orElseThrow(() -> new ClubNotFoundException("클럽을 찾을 수 없습니다. NOT_FOUND"));

        // 2. 유저 아이디로 엔티티 가져오기
        UserEntity userEntity = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new UserNotFoundException("사용자를 찾을 수 없습니다. NOT_FOUND"));   

        // 3. 중복 참여 체크: 이미 참여한 내역이 있으면 예외 발생
        Optional<ClubMemberEntity> existingClubs = clubMemberRepository
                .findByClubAndUser(clubEntity, userEntity);
        if (existingClubs.isPresent()) {
            throw new ClubMemberAlreadyExistsException("이미 참여한 클럽입니다. CONFLICT"); // 참여, 참여 신청
        }
        // 승인된 유저 숫자 count
		List<ClubMemberEntity> memberCount = clubMemberRepository
        		.findByClubAndParticipantStatus(clubEntity, ParticipantStatus.승인);
				 
        // 4. 클럽 멤버가 가득차면 신청 못하게 예외 처리
        if(memberCount.size() >= clubEntity.getMaxUser()) {
            throw new ClubMemberFullException("클럽의 인원이 가득 찼습니다. CONFLICT");
        }
        
        // 5. ClubMemberEntity에 빌더
        ClubMemberEntity clubMemberEntity = ClubMemberEntity.builder()
        		.user(userEntity)
        		.club(clubEntity)
        		.role(Role.멤버)
        		.participantStatus(ParticipantStatus.신청대기)
        		.build();
        
        clubMemberRepository.save(clubMemberEntity);

	}

	// 클럽 가입 수락 서비스
	@Transactional
	public void clubMemberAccept(Long clubId, Long userId, Authentication authentication) {

		// 1. 클럽 아이디로 엔티티 가져오기 
        ClubEntity clubEntity = clubRepository.findById(clubId)
                .orElseThrow(() -> new ClubNotFoundException("클럽을 찾을 수 없습니다. NOT_FOUND"));

        // 2. 유저 아이디로 엔티티 가져오기
        UserEntity userEntity = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new UserNotFoundException("사용자를 찾을 수 없습니다. NOT_FOUND"));   
        
        // 3. 클럽 관리자와 로그인한 사람이 일치하는지 확인 (승인 권한 확인) -> 403 FORBIDDEN
        if (!userEntity.getUserId().equals(clubEntity.getClubLeader().getUserId() )) {
            throw new ClubLeaderMismatchException("유저와 번개 생성자가 같지 않음 FORBIDDEN");
        }

        // 4. 승인 대상 참가 신청자 조회 (존재하지 않으면 404)
        ClubMemberEntity joinUserEntity = clubMemberRepository.findByClubAndUser_UserId(clubEntity, userId)
        		.orElseThrow(() -> new UserNotFoundException("사용자를 찾을 수 없습니다. NOT_FOUND")); 

        // 5. 해당 클럽 참가 신청자와 클럽이 일치하는지 확인
        if (!joinUserEntity.getClub().getClubId().equals(clubEntity.getClubId())) {
            throw new ClubMemberMismatchException("클럽과 참가 신청하는 유저가 일치하지 않음");
        }
        
        // 6. 클럽 참가 신청자의 상태가 '신청대기'인지 확인 (아니면 승인/거절 불가)
        if (joinUserEntity.getParticipantStatus() != ParticipantStatus.신청대기) {
            throw new ClubStatusMismatchException("클럽 참가 신청자가 신청대기 상태가 아닌 경우");
        }

        // 7. 승인 처리
        joinUserEntity.setParticipantStatus(ClubMemberEntity.ParticipantStatus.승인);
        
	}
}
