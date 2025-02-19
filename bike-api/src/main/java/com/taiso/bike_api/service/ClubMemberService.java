package com.taiso.bike_api.service;

import com.taiso.bike_api.domain.ClubEntity;
import com.taiso.bike_api.domain.ClubMemberEntity;
import com.taiso.bike_api.domain.ClubMemberEntity.ParticipantStatus;
import com.taiso.bike_api.domain.ClubMemberEntity.Role;
import com.taiso.bike_api.domain.UserEntity;
import com.taiso.bike_api.domain.UserDetailEntity;

import com.taiso.bike_api.dto.ClubJoinResponseDTO;
import com.taiso.bike_api.dto.ClubJoinAcceptResponseDTO;
import com.taiso.bike_api.dto.ClubJoinRejectResponseDTO;

import com.taiso.bike_api.repository.ClubMemberRepository;
import com.taiso.bike_api.repository.ClubRepository;
import com.taiso.bike_api.repository.UserDetailRepository;
import com.taiso.bike_api.repository.UserRepository;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ClubMemberService {

    private final ClubRepository clubRepository;
    private final ClubMemberRepository clubMemberRepository;
    private final UserRepository userRepository;
    private final UserDetailRepository userDetailRepository;

    @Autowired
    public ClubMemberService(ClubRepository clubRepository,
                             ClubMemberRepository clubMemberRepository,
                             UserRepository userRepository,
                             UserDetailRepository userDetailRepository) {
        this.clubRepository = clubRepository;
        this.clubMemberRepository = clubMemberRepository;
        this.userRepository = userRepository;
        this.userDetailRepository = userDetailRepository;
    }

    // 클러 가입 신청
    public ClubJoinResponseDTO joinClub(Long clubId, String email) {
        // 1. 클럽 존재 여부 확인
        ClubEntity club = clubRepository.findById(clubId)
            .orElseThrow(() -> new IllegalArgumentException("클럽이 존재하지 않습니다."));

        // 2. 사용자 조회 (이메일 기준)
        UserEntity user = userRepository.findByEmail(email)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // 3. 기존 클럽 가입(또는 신청) 기록 확인
        Optional<ClubMemberEntity> existingMembershipOpt = 
                clubMemberRepository.findByUserAndClub(user, club);
        if (existingMembershipOpt.isPresent()) {
            ClubMemberEntity existing = existingMembershipOpt.get();
            if (existing.getParticipantStatus() == ParticipantStatus.신청대기) {
                throw new IllegalArgumentException("이미 해당 클럽에 참가 신청을 했습니다.");
            } else if (existing.getParticipantStatus() == ParticipantStatus.승인 ||
                       existing.getParticipantStatus() == ParticipantStatus.완료) {
                throw new IllegalArgumentException("이미 해당 클럽에 참여했습니다.");
            }
        }

        // 4. 새로운 클럽 가입 신청 생성 (참가 상태: 신청대기, 역할: 멤버)
        ClubMemberEntity clubMember = ClubMemberEntity.builder()
            .user(user)
            .club(club)
            .role(Role.멤버)
            .participantStatus(ParticipantStatus.신청대기)
            .build();

        clubMemberRepository.save(clubMember);

        // 5. 응답 DTO 생성 (clubMember.getJoinedAt()는 @CreationTimestamp로 자동 설정됨)
        return ClubJoinResponseDTO.builder()
                .clubId(club.getClubId())
                .userId(user.getUserId())
                .clubName(club.getClubName())
                .joinedAt(clubMember.getJoinedAt())
                .message("참가 신청이 완료되었습니다.")
                .build();
    }

    // 클럽 가입 승인
    public ClubJoinAcceptResponseDTO acceptClubJoin(Long clubId, Long userId, String adminEmail) {
        // 1. 관리자(어드민) 권한 확인
        UserEntity adminUser = userRepository.findByEmail(adminEmail)
            .orElseThrow(() -> new IllegalArgumentException("Admin user not found"));
        if (!adminUser.getRole().getRoleName().equalsIgnoreCase("ADMIN")) {
            throw new IllegalArgumentException("관리자 권한이 필요합니다.");
        }

        // 2. 클럽 존재 여부 확인
        ClubEntity club = clubRepository.findById(clubId)
            .orElseThrow(() -> new IllegalArgumentException("클럽이 존재하지 않습니다."));

        // 3. 대상 사용자의 존재 여부 확인
        UserEntity targetUser = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("해당 사용자의 참가 신청이 존재하지 않습니다."));

        // 4. 클럽 멤버(가입 신청) 기록 조회
        Optional<ClubMemberEntity> membershipOpt = clubMemberRepository.findByUserAndClub(targetUser, club);
        ClubMemberEntity membership = membershipOpt.orElseThrow(
                () -> new IllegalArgumentException("해당 사용자의 참가 신청이 존재하지 않습니다."));

        // 5. 이미 승인(또는 완료)된 가입 신청인지 확인
        if (membership.getParticipantStatus() == ParticipantStatus.승인 ||
            membership.getParticipantStatus() == ParticipantStatus.완료) {
            throw new IllegalArgumentException("넌 이미 클럽 가입이 승인되었단다.");
        }

        // 6. 가입 신청 수락 처리: 참가 상태를 '승인'으로 변경
        membership.setParticipantStatus(ParticipantStatus.승인);
        clubMemberRepository.save(membership);

        // 7. 대상 사용자의 닉네임 조회 (UserDetailEntity)
        UserDetailEntity userDetail = userDetailRepository.findById(userId).orElse(null);
        String nickname = (userDetail != null) ? userDetail.getUserNickname() : "";

        // 8. 응답 DTO 생성 및 반환
        return ClubJoinAcceptResponseDTO.builder()
                .clubId(club.getClubId())
                .userId(userId)
                .userNickname(nickname)
                .participantStatus(membership.getParticipantStatus().toString())
                .role(membership.getRole().toString())
                .joinedAt(membership.getJoinedAt())
                .message("가입이 완료 되었습니다.")
                .build();
    }

    // 클럽 가입 거절
    public ClubJoinRejectResponseDTO rejectClubJoin(Long clubId, Long userId, String adminEmail) {
        // 1. 관리자(어드민) 권한 확인
        UserEntity adminUser = userRepository.findByEmail(adminEmail)
            .orElseThrow(() -> new IllegalArgumentException("Admin user not found"));
        if (!adminUser.getRole().getRoleName().equalsIgnoreCase("ADMIN")) {
            throw new IllegalArgumentException("관리자 권한이 필요합니다.");
        }

        // 2. 클럽 존재 여부 확인
        ClubEntity club = clubRepository.findById(clubId)
            .orElseThrow(() -> new IllegalArgumentException("클럽이 존재하지 않습니다."));

        // 3. 대상 사용자 존재 여부 확인
        UserEntity targetUser = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("해당 사용자의 참가 신청이 존재하지 않습니다."));

        // 4. 클럽 멤버(가입 신청) 기록 조회
        Optional<ClubMemberEntity> membershipOpt = clubMemberRepository.findByUserAndClub(targetUser, club);
        ClubMemberEntity membership = membershipOpt.orElseThrow(
                () -> new IllegalArgumentException("해당 사용자의 참가 신청이 존재하지 않습니다."));

        // 5. 이미 승인 또는 완료된 가입 신청인 경우 거절 불가
        if (membership.getParticipantStatus() == ParticipantStatus.승인 ||
            membership.getParticipantStatus() == ParticipantStatus.완료) {
            throw new IllegalArgumentException("넌 이미 클럽 가입이 승인되었단다.");
        }

        // 6. 가입 거절 처리: (신청대기 상태의 경우) 해당 가입 신청 기록 삭제
        //    (삭제 전 정보를 응답용으로 보존)
        ClubMemberEntity membershipInfo = ClubMemberEntity.builder()
                .memberId(membership.getMemberId())
                .user(membership.getUser())
                .club(membership.getClub())
                .role(membership.getRole())
                .participantStatus(membership.getParticipantStatus())
                .joinedAt(membership.getJoinedAt())
                .build();

        clubMemberRepository.delete(membership);

        // 7. 대상 사용자의 닉네임 조회 (UserDetailEntity)
        UserDetailEntity userDetail = userDetailRepository.findById(userId).orElse(null);
        String nickname = (userDetail != null) ? userDetail.getUserNickname() : "";

        // 8. 응답 DTO 생성 (메시지는 가입 신청 거절을 의미)
        return ClubJoinRejectResponseDTO.builder()
                .clubId(club.getClubId())
                .userId(userId)
                .userNickname(nickname)
                .participantStatus(membershipInfo.getParticipantStatus().toString())
                .role(membershipInfo.getRole().toString())
                .joinedAt(membershipInfo.getJoinedAt())
                .message("가입 신청이 거절되었습니다.")
                .build();
    }

}
