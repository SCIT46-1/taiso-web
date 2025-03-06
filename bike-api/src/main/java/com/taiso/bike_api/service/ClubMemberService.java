package com.taiso.bike_api.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import com.taiso.bike_api.domain.ClubEntity;
import com.taiso.bike_api.domain.ClubMemberEntity;
import com.taiso.bike_api.domain.ClubMemberEntity.ParticipantStatus;
import com.taiso.bike_api.domain.ClubMemberEntity.Role;
import com.taiso.bike_api.domain.LightningEntity;
import com.taiso.bike_api.domain.UserEntity;
import com.taiso.bike_api.dto.ClubLightningListResponseDTO;
import com.taiso.bike_api.exception.ClubLeaderCannotLeaveException;
import com.taiso.bike_api.exception.ClubLeaderMismatchException;
import com.taiso.bike_api.exception.ClubMemberAlreadyExistsException;
import com.taiso.bike_api.exception.ClubMemberFullException;
import com.taiso.bike_api.exception.ClubMemberMismatchException;
import com.taiso.bike_api.exception.ClubMemberNotFoundException;
import com.taiso.bike_api.exception.ClubNotFoundException;
import com.taiso.bike_api.exception.ClubStatusMismatchException;
import com.taiso.bike_api.exception.LightningNotFoundException;
import com.taiso.bike_api.exception.UserNotFoundException;
import com.taiso.bike_api.repository.ClubMemberRepository;
import com.taiso.bike_api.repository.ClubRepository;
import com.taiso.bike_api.repository.LightningRepository;
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
	
	@Autowired
	private LightningRepository lightningRepository;
	
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
            throw new ClubLeaderMismatchException("유저와 클럽 생성자가 같지 않음 FORBIDDEN");
        }

        // 4. 승인 대상 참가 신청자 조회 (존재하지 않으면 404)
        ClubMemberEntity joinUserEntity = clubMemberRepository.findByClubAndUser_UserId(clubEntity, userId)
        		.orElseThrow(() -> new UserNotFoundException("클럽 가입 신청 사용자를 찾을 수 없습니다. NOT_FOUND")); 

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

	// 클럽 가입 거절 서비스
	@Transactional
	public void clubMemberReject(Long clubId, Long userId, Authentication authentication) {

		// 1. 클럽 아이디로 엔티티 가져오기 
        ClubEntity clubEntity = clubRepository.findById(clubId)
                .orElseThrow(() -> new ClubNotFoundException("클럽을 찾을 수 없습니다. NOT_FOUND"));

        // 2. 유저 아이디로 엔티티 가져오기
        UserEntity userEntity = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new UserNotFoundException("사용자를 찾을 수 없습니다. NOT_FOUND"));   
        
        // 3. 클럽 관리자와 로그인한 사람이 일치하는지 확인 (승인 권한 확인) -> 403 FORBIDDEN
        if (!userEntity.getUserId().equals(clubEntity.getClubLeader().getUserId() )) {
            throw new ClubLeaderMismatchException("유저와 클럽 생성자가 같지 않음 FORBIDDEN");
        }

        // 4. 거절 대상 신청자 조회 (존재하지 않으면 404)
        ClubMemberEntity joinUserEntity = clubMemberRepository.findByClubAndUser_UserId(clubEntity, userId)
        		.orElseThrow(() -> new UserNotFoundException("클럽 가입 신청 사용자를 찾을 수 없습니다. NOT_FOUND")); 

        // 5. 해당 클럽 참가 신청자와 클럽이 일치하는지 확인
        if (!joinUserEntity.getClub().getClubId().equals(clubEntity.getClubId())) {
            throw new ClubMemberMismatchException("클럽과 참가 신청하는 유저가 일치하지 않음");
        }
        
        // 6. 클럽 참가 신청자의 상태가 '신청대기'인지 확인 (아니면 승인/거절 불가)
        if (joinUserEntity.getParticipantStatus() != ParticipantStatus.신청대기) {
            throw new ClubStatusMismatchException("클럽 참가 신청자가 신청대기 상태가 아닙니다.");
        }

        // 7. 거절(탈퇴) 처리
        joinUserEntity.setParticipantStatus(ClubMemberEntity.ParticipantStatus.탈퇴);
        
	}

	// 클럽 회원 탈퇴 서비스
	public void clubMemberWithdrawal(Long clubId, Authentication authentication) {

		// 1. 클럽 아이디로 엔티티 가져오기 
        ClubEntity clubEntity = clubRepository.findById(clubId)
                .orElseThrow(() -> new ClubNotFoundException("클럽을 찾을 수 없습니다. NOT_FOUND"));

        // 2. 유저 아이디로 엔티티 가져오기
        UserEntity userEntity = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new UserNotFoundException("사용자를 찾을 수 없습니다. NOT_FOUND"));   

        // 3. 회원이 클럽에 존재하는지 확인 (존재하지 않으면 404)
        ClubMemberEntity joinUserEntity = clubMemberRepository.findByClubAndUser(clubEntity, userEntity)
        		.orElseThrow(() -> new UserNotFoundException("클럽에서 사용자를 찾을 수 없습니다. NOT_FOUND")); 

        // 4. 해당 클럽 참가 신청자와 클럽이 일치하는지 확인
        if (!joinUserEntity.getClub().getClubId().equals(clubEntity.getClubId())) {
            throw new ClubMemberMismatchException("클럽과 탈퇴하는 유저가 일치하지 않음");
        }

        // 5. 클럽 탈퇴 신청자의 상태가 '탈퇴'상태가 아닌지 확인(거절 상태인데 탈퇴하고 다시 신청하는 경우 방지)
        if (joinUserEntity.getParticipantStatus() == ParticipantStatus.탈퇴) {
            throw new ClubStatusMismatchException("클럽 탈퇴 유저가 거절 상태입니다.(탈퇴)");
        }

        // 6. 탈퇴 회원이 클럽 관리자가 아닌지 확인 (관리자는 클럽장 위임 후 탈퇴 가능) 403 FORBIDDEN
        if (userEntity.getUserId().equals(clubEntity.getClubLeader().getUserId() )) {
            throw new ClubLeaderCannotLeaveException("탈퇴 회원이 클럽 관리자로 되어있음 FORBIDDEN");
        }

        // 7. 거절(탈퇴) 처리
        clubMemberRepository.deleteById(joinUserEntity.getMemberId());
		
	}

	// 클럽 번개 리스트 조회 서비스
	public List<ClubLightningListResponseDTO> clubLightningsList(Long clubId, Authentication authentication) {

		// 1. 클럽 아이디로 엔티티 가져오기 
        ClubEntity clubEntity = clubRepository.findById(clubId)
                .orElseThrow(() -> new ClubNotFoundException("클럽을 찾을 수 없습니다. NOT_FOUND"));
        
        // 2. 유저 아이디로 엔티티 가져오기
        UserEntity userEntity = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new UserNotFoundException("사용자를 찾을 수 없습니다. NOT_FOUND"));  

        // 3. 회원이 클럽에 존재하는지 확인 (존재하지 않으면 404)
        ClubMemberEntity joinUserEntity = clubMemberRepository.findByClubAndUser(clubEntity, userEntity)
        		.orElseThrow(() -> new ClubMemberNotFoundException("클럽에서 사용자를 찾을 수 없습니다. NOT_FOUND")); 
        
        // 4. 리스트 조회자가 클럽에 승인 되어 있는지 확인 필요
        if (joinUserEntity.getParticipantStatus() != ParticipantStatus.승인) {
            throw new ClubStatusMismatchException("리스트 조회자가 클럽에 승인 상태가 아닙니다.");
        }
        
        // 5. 클럽의 번개가 존재하지 않는 경우 예외 처리 404 
        List<LightningEntity> lightningList = lightningRepository.findByClubId(clubEntity.getClubId());
        if (lightningList.isEmpty()) {
            throw new LightningNotFoundException("클럽의 번개가 존재하지 않습니다. NOT_FOUND");
        }
        
        // 6. 엔티티를 DTO로 매핑 (별도 매핑 메서드 사용)
        List<ClubLightningListResponseDTO> responseList = lightningList.stream()
                .map(this::mapToClubLightningListResponseDTO)
                .collect(Collectors.toList());

        log.info("Retrieved {} lightning events for club {}", responseList.size(), clubId);
        
        return responseList;
	}
	
	// ClubLightningListResponseDTO 매핑 (클럽 번개 리스트 조회)
	private ClubLightningListResponseDTO mapToClubLightningListResponseDTO(LightningEntity lightning) {
	    // 라우트가 널일 가능성을 고려
	    Long routeId = (lightning.getRoute() != null) ? lightning.getRoute().getRouteId() : null;
	    
	    // 참가자 목록이 널이면 0으로 처리
	    int currentParticipant = (lightning.getLightningUsers() != null) ? lightning.getLightningUsers().size() : 0;

	    return ClubLightningListResponseDTO.builder()
	            .lightningId(lightning.getLightningId())
	            .creatorId(lightning.getCreatorId())
	            .title(lightning.getTitle())
	            .eventDate(lightning.getEventDate())
	            .duration(lightning.getDuration())
	            .createdAt(lightning.getCreatedAt())
	            .status(lightning.getStatus())
	            .capacity(lightning.getCapacity())
	            .currentParticipant(currentParticipant)
	            .gender(lightning.getGender())
	            .level(lightning.getLevel())
	            .bikeType(lightning.getBikeType())
	            .tags(lightning.getTags())
	            .address(lightning.getAddress())
	            .clubId(lightning.getClubId())
	            .routeId(routeId)
	            .build();
	}

	// 클럽장 위임 서비스
	@Transactional
	public void clubLeader(Long clubId, Long userId, Authentication authentication) {

		// 1. 클럽 아이디로 엔티티 가져오기 
        ClubEntity clubEntity = clubRepository.findById(clubId)
                .orElseThrow(() -> new ClubNotFoundException("클럽을 찾을 수 없습니다. NOT_FOUND"));

        // 2. 로그인 사용자 엔티티 가져오기
        UserEntity currentUser = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new UserNotFoundException("사용자를 찾을 수 없습니다. NOT_FOUND"));   
        
        // 3. 현재 사용자가 클럽 리더인지 확인 (승인 권한 확인) -> 403 FORBIDDEN
        if (!currentUser.getUserId().equals(clubEntity.getClubLeader().getUserId() )) {
            throw new ClubLeaderMismatchException("클럽 리더만 클럽장 위임을 할 수 있음 FORBIDDEN");
        }

        // 4. 클럽장을 받는 유저와 클럽이 일치하는지 조회 (존재하지 않으면 404)
        ClubMemberEntity newLeaderMember = clubMemberRepository.findByClubAndUser_UserId(clubEntity, userId)
        		.orElseThrow(() -> new UserNotFoundException("클럽장이 되는 사용자를 클럽에서 찾을 수 없습니다. NOT_FOUND")); 

        // 5. 클럽장을 받는 유저와 클럽이 일치하는지 확인
        if (!newLeaderMember.getClub().getClubId().equals(clubEntity.getClubId())) {
            throw new ClubMemberMismatchException("클럽과 클럽장이 되는 대상이 일치하지 않음");
        }  
        
        // 6. 클럽장을 받는 유저가 클럽에 승인 되어 있는지 확인 필요
        if (newLeaderMember.getParticipantStatus() != ParticipantStatus.승인) {
            throw new ClubStatusMismatchException("클럽장을 받는 유저가 승인 상태가 아닙니다.");
        }

        // 7. 클럽장을 받는 유저 entity 가져오기
        UserEntity newLeaderUser = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("사용자를 찾을 수 없습니다. NOT_FOUND")); 
        
        // 8. 클럽장을 멤버로 변경하기 위한 clubMemberEntity 가져오기
        ClubMemberEntity ClubleaderEntity = clubMemberRepository.findByClubAndUser_UserId(clubEntity, currentUser.getUserId())
        		.orElseThrow(() -> new UserNotFoundException("클럽장 사용자를 찾을 수 없습니다. NOT_FOUND"));
        
        // 9. 클럽장 위임
        newLeaderMember.setRole(ClubMemberEntity.Role.클럽장);
        ClubleaderEntity.setRole(ClubMemberEntity.Role.멤버);
        clubEntity.setClubLeader(newLeaderUser);
        
	}
	
	
}
