package com.taiso.bike_api.service;

import com.taiso.bike_api.domain.ClubEntity;
import com.taiso.bike_api.domain.ClubMemberEntity;
import com.taiso.bike_api.domain.ClubMemberEntity.ParticipantStatus;
import com.taiso.bike_api.domain.ClubMemberEntity.Role;
import com.taiso.bike_api.domain.UserEntity;
import com.taiso.bike_api.dto.ClubJoinResponseDTO;
import com.taiso.bike_api.repository.ClubMemberRepository;
import com.taiso.bike_api.repository.ClubRepository;
import com.taiso.bike_api.repository.UserRepository;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ClubMemberService {

    private final ClubRepository clubRepository;
    private final ClubMemberRepository clubMemberRepository;
    private final UserRepository userRepository;

    @Autowired
    public ClubMemberService(ClubRepository clubRepository,
                             ClubMemberRepository clubMemberRepository,
                             UserRepository userRepository) {
        this.clubRepository = clubRepository;
        this.clubMemberRepository = clubMemberRepository;
        this.userRepository = userRepository;
    }

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
}
