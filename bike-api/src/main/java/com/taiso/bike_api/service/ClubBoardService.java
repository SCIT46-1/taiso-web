package com.taiso.bike_api.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import com.taiso.bike_api.domain.ClubBoardEntity;
import com.taiso.bike_api.domain.ClubEntity;
import com.taiso.bike_api.domain.ClubMemberEntity;
import com.taiso.bike_api.domain.UserDetailEntity;
import com.taiso.bike_api.domain.UserEntity;
import com.taiso.bike_api.dto.ClubBoardGetResponseDTO;
import com.taiso.bike_api.dto.ClubBoardListResponseDTO;
import com.taiso.bike_api.dto.ClubBoardPatchRequestDTO;
import com.taiso.bike_api.dto.ClubBoardPostRequestDTO;
import com.taiso.bike_api.dto.ResponseClubBoardListDTO;
import com.taiso.bike_api.exception.ClubBoardNotFoundException;
import com.taiso.bike_api.exception.ClubBoardNotPermissionException;
import com.taiso.bike_api.exception.ClubBoardNoticeNotPermissionException;
import com.taiso.bike_api.exception.ClubMemberMismatchException;
import com.taiso.bike_api.exception.ClubNotFoundException;
import com.taiso.bike_api.exception.UserNotFoundException;
import com.taiso.bike_api.repository.ClubBoardRepository;
import com.taiso.bike_api.repository.ClubMemberRepository;
import com.taiso.bike_api.repository.ClubRepository;
import com.taiso.bike_api.repository.UserDetailRepository;
import com.taiso.bike_api.repository.UserRepository;

import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;

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

    @Autowired
    private UserDetailRepository userDetailRepository;

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

    // 클럽보드 게시글 수정
    @Transactional
    public void patchClubBoard(ClubBoardPatchRequestDTO clubBoardPatchRequestDTO, Long clubId, Long boardId, Authentication authentication) {

        // 들어온 수정 데이터 예외 처리..?

        // 해당 클럽 조회
        ClubEntity club = clubRepository.findById(clubId)
                .orElseThrow(() -> new ClubNotFoundException("해당 클럽을 찾을 수 없습니다."));

        // 현재 사용자 조회
        UserEntity user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new UserNotFoundException("현재 사용자를 찾을 수 없습니다."));

        // 해당 보드 조회
        ClubBoardEntity board = clubBoardRepository.findById(boardId)
                .orElseThrow(() -> new ClubBoardNotFoundException("해당 게시글을 찾을 수 없습니다."));

        // 클럽 가입여부 확인
        Optional<ClubMemberEntity> existingClubMember = clubMemberRepository.findByClubAndUser_UserId(club,user.getUserId());
        log.info("현재 유저의 ID : {}", existingClubMember);
        if (existingClubMember.isEmpty()) {
            throw new ClubMemberMismatchException("해당 클럽 회원이 아닙니다.");
        }

        // 수정 권한 확인 (작성자 or 클럽장)
        if (board.getPostWriter() != user) {
            throw new ClubBoardNotPermissionException("해당 게시글의 작성자가 아닙니다.");
        }

        // 빌드
        ClubBoardEntity fatchBoard = ClubBoardEntity.builder()
                .postTitle(clubBoardPatchRequestDTO.getPostTitle())
                .postContent(clubBoardPatchRequestDTO.getPostContent())
                .isNotice(clubBoardPatchRequestDTO.getIsNotice())
                .build();

        // 변경사항 덮어쓰기
        board.setPostTitle(fatchBoard.getPostTitle());
        board.setPostContent(fatchBoard.getPostContent());
            // isNotice는 권한이 있을 때만 적용
            if (club.getClubLeader() == user) {
                board.setIsNotice(fatchBoard.getIsNotice());
            }

        // 안전 재저장
        clubBoardRepository.save(board);

    }


    public ClubBoardGetResponseDTO getClubBoardOne(Long clubId, Long boardId, Authentication authentication) {

        // 해당 클럽 조회
        ClubEntity club = clubRepository.findById(clubId)
                .orElseThrow(() -> new ClubNotFoundException("해당 클럽을 찾을 수 없습니다."));

        // 현재 사용자 조회
        UserEntity user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new UserNotFoundException("현재 사용자를 찾을 수 없습니다."));

        // 클럽 가입여부 확인
        Optional<ClubMemberEntity> existingClubMember = clubMemberRepository.findByClubAndUser_UserId(club,user.getUserId());
        log.info("현재 유저의 ID : {}", existingClubMember);
        if (existingClubMember.isEmpty()) {
            throw new ClubMemberMismatchException("해당 클럽 회원이 아닙니다.");
        }

        // 해당 보드 조회
        ClubBoardEntity board = clubBoardRepository.findById(boardId)
                .orElseThrow(() -> new ClubBoardNotFoundException("해당 게시글을 찾을 수 없습니다."));

        // 보드 작성자 디테일 조회
        UserDetailEntity creatorDetail = userRepository.findById(board.getPostWriter().getUserId())
                .flatMap(creator -> userDetailRepository.findById(user.getUserId()))
                .orElseThrow(() -> new UserNotFoundException("존재하지 않는 유저입니다."));

        // 관리자 권한 확인 (작성자 or 클럽장)
        Boolean canEdit = false; // 작성자만 가능
        Boolean canDelete = false; // 둘다 가능

        if (board.getPostWriter() == user || club.getClubLeader() == user) {
            canEdit = true;
        }
        if (board.getPostWriter() == user) {
            canDelete = true;
        }

        // 빌드
        ClubBoardGetResponseDTO boardOne = ClubBoardGetResponseDTO.builder()
                .postId(board.getPostId())
                .postWriter(board.getPostWriter().getUserId())
                .writerNickname(creatorDetail.getUserNickname())
                .writerProfileImg(creatorDetail.getUserProfileImg())
                .postTitle(board.getPostTitle())
                .postContent(board.getPostContent())
                .createdAt(board.getCreatedAt())
                .updatedAt(board.getUpdatedAt())
                .isNotice(board.getIsNotice())
                .canEdit(canEdit)
                .canDelete(canDelete)
                .build();

        return boardOne;
    }

    // 클럽 보드 리스트 조회
    public ClubBoardListResponseDTO getClubBoardList(int page, int size, String sort, Long clubId, Authentication authentication) {

        // 해당 클럽 조회
        ClubEntity club = clubRepository.findById(clubId)
                .orElseThrow(() -> new ClubNotFoundException("해당 클럽을 찾을 수 없습니다."));
        // 현재 사용자 조회
        UserEntity user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new UserNotFoundException("현재 사용자를 찾을 수 없습니다."));

        // 정렬 기준 설정
        Sort sortObj = Sort.unsorted();
        if (!sort.isEmpty()) {
            sortObj = Sort.by(sort).ascending();
        }
        // 페이지 요청 생성
        Pageable pageable = PageRequest.of(page, size, sortObj);
        
        // 필터링 조건 생성 - 클럽 ID로 필터링
        Specification<ClubBoardEntity> spec = (root, query, criteriaBuilder) -> 
            criteriaBuilder.equal(root.get("club").get("clubId"), clubId);

        // 필터링된 데이터로 페이징 조회
        Page<ClubBoardEntity> clubBoardPage = clubBoardRepository.findAll(spec, pageable);

        // 1. clubBoardPage에서 가져온 모든 userId를 추출하여 한 번에 조회
        List<Long> userIds = clubBoardPage.getContent().stream()
                .map(culbBoard -> culbBoard.getPostWriter().getUserId())
                .filter(Objects::nonNull) // userId가 null인 경우 제거
                .distinct() // 중복 제거
                .collect(Collectors.toList());

        // 2. 한 번의 DB 조회로 모든 UserDetailEntity 가져오기
        List<UserDetailEntity> userDetails = userDetailRepository.findByUserIdIn(userIds);
        Map<Long, UserDetailEntity> writerDetailMap = userIds.isEmpty()
                ? new HashMap<>()
                : userDetails.stream()
                .distinct()  // 중복 제거 (equals/hashCode가 올바르게 구현되어 있어야 함)
                .collect(Collectors.toMap(
                        UserDetailEntity::getUserId,
                        detail -> detail
                ));

        // 3. clubBoardPage의 데이터를 ResponseClubBoardListDTO로 변환
        List<ResponseClubBoardListDTO> clubBoardDTO = clubBoardPage.getContent().stream()
                .map(culbBoard -> {
                    Long writerId = culbBoard.getPostWriter().getUserId();
                    UserDetailEntity writerDetail = writerDetailMap.get(writerId); // 미리 가져온 Map에서 조회

                    return ResponseClubBoardListDTO.builder()
                            .postId(culbBoard.getPostId())
                            .postTitle(culbBoard.getPostTitle())
                            .postWriter(writerId)
                            .writerNickname(writerDetail != null ? writerDetail.getUserNickname() : "알 수 없음") // 닉네임 가져오기
                            .writerProfileImg(writerDetail != null ? writerDetail.getUserProfileImg() : null) // 프로필 이미지 가져오기
                            .postContent(culbBoard.getPostContent())
                            .createdAt(culbBoard.getCreatedAt())
                            .updatedAt(culbBoard.getUpdatedAt())
                            .isNotice(culbBoard.getIsNotice())
                            // 권한 확인
                            .canEdit(culbBoard.getPostWriter().equals(user) || club.getClubLeader().equals(user)) // 작성자 또는 클럽장 가능
                            .canDelete(culbBoard.getPostWriter().equals(user)) // 작성자만 가능
                            .build();
                })
                .collect(Collectors.toList());

        return ClubBoardListResponseDTO.builder()
                .content(clubBoardDTO)
                .pageNo(clubBoardPage.getNumber() + 1)
                .pageSize(clubBoardPage.getSize())
                .totalElements(clubBoardPage.getTotalElements())
                .totalPages(clubBoardPage.getTotalPages())
                .last(clubBoardPage.isLast())
                .build();


    }
}
