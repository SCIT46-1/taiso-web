package com.taiso.bike_api.service;

import com.taiso.bike_api.domain.ClubBoardEntity;
import com.taiso.bike_api.domain.ClubEntity;
import com.taiso.bike_api.domain.ClubMemberEntity;
import com.taiso.bike_api.domain.UserEntity;
import com.taiso.bike_api.dto.ClubBoardPostRequestDTO;
import com.taiso.bike_api.exception.*;
import com.taiso.bike_api.repository.ClubBoardRepository;
import com.taiso.bike_api.repository.ClubMemberRepository;
import com.taiso.bike_api.repository.ClubRepository;
import com.taiso.bike_api.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Slf4j
@Service
public class ClubBoardService {

    @Autowired
    private ClubBoardRepository clubBoardRepository;

    @Autowired
    private ClubRepository clubRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ClubMemberRepository clubMemberRepository;

    // 클럽보드 게시글 작성
    public void createClubBoard(ClubBoardPostRequestDTO clubBoardPostRequestDTO, Long clubId, Authentication authentication) {

        log.info("들어온 클럽ID : {}", clubId);
        // 해당 클럽 조회
        ClubEntity club = clubRepository.findById(clubId)
                .orElseThrow(() -> new ClubNotFoundException("해당 클럽을 찾을 수 없습니다."));

        // 현재 사용자 조회
        UserEntity user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new UserNotFoundException("현재 사용자를 찾을 수 없습니다."));

        log.info("들어온 클럽의 리더 ID : {}", club.getClubLeader().getUserId());
        log.info("현재 유저의 ID : {}", user.getUserId());
        // 클럽 가입여부 확인
        Optional<ClubMemberEntity> existingClubMember = clubMemberRepository.findByClubAndUser_UserId(club,user.getUserId());
        log.info("현재 유저의 ID : {}", existingClubMember);
        if (existingClubMember.isEmpty()) {
            throw new ClubMemberMismatchException("해당 클럽 회원만 게시글을 작성할 수 있습니다.");
        }

        // 공지글의 경우 작성 권한 확인
        if (clubBoardPostRequestDTO.getIsNotice()) {
            if (club.getClubLeader() != user) {
                throw new ClubBoardNoticeNotPermissionException("공지글 작성 권한이 없습니다.");
            }
        }

        // 빌드
        ClubBoardEntity board = ClubBoardEntity.builder()
                .club(club)
                .postWriter(user)
                .postTitle(clubBoardPostRequestDTO.getPostTitle())
                .postContent(clubBoardPostRequestDTO.getPostContent())
                .isNotice(clubBoardPostRequestDTO.getIsNotice())
                .build();

        // Entity 저장
        clubBoardRepository.save(board);

    }

    // 클럽보드 게시글 삭제
    public void deleteClubBoard(Long clubId, Long boardId, Authentication authentication) {

        // 해당 클럽 조회
        ClubEntity club = clubRepository.findById(clubId)
                .orElseThrow(() -> new ClubNotFoundException("해당 클럽을 찾을 수 없습니다."));

        // 현재 사용자 조회
        UserEntity user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new UserNotFoundException("현재 사용자를 찾을 수 없습니다."));

        ClubBoardEntity board = clubBoardRepository.findById(boardId)
                .orElseThrow(() -> new ClubBoardNotFoundException("해당 게시글을 찾을 수 없습니다."));

        // 클럽 가입여부 확인
        Optional<ClubMemberEntity> existingClubMember = clubMemberRepository.findByClubAndUser_UserId(club,user.getUserId());
        log.info("현재 유저의 ID : {}", existingClubMember);
        if (existingClubMember.isEmpty()) {
            throw new ClubMemberMismatchException("해당 클럽 회원이 아닙니다.");
        }

        // 삭제 권한 확인 (작성자 or 클럽장)
        if (board.getPostWriter() != user) {
            if (club.getClubLeader() != user) {
                throw new ClubBoardNotPermissionException("해당 게시글을 삭제할 권한이 없습니다.");
            }
            throw new ClubBoardNotPermissionException("해당 게시글의 작성자가 아닙니다.");
        }
            // 통과 후 삭제
            else clubBoardRepository.delete(board);






    }
}
