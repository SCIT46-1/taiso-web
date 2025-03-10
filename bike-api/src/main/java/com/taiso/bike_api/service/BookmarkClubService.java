package com.taiso.bike_api.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import com.taiso.bike_api.domain.BookmarkEntity;
import com.taiso.bike_api.domain.BookmarkEntity.BookmarkType;
import com.taiso.bike_api.domain.ClubEntity;
import com.taiso.bike_api.domain.ClubMemberEntity.ParticipantStatus;
import com.taiso.bike_api.domain.UserEntity;
import com.taiso.bike_api.dto.BookmarkClubCreateResponseDTO;
import com.taiso.bike_api.dto.BookmarkClubDeleteResponseDTO;
import com.taiso.bike_api.dto.BookmarkClubResponseDTO;
import com.taiso.bike_api.dto.BookmarkClubsGetResponseDTO;
import com.taiso.bike_api.exception.BookmarkAlreadyExistsException;
import com.taiso.bike_api.exception.BookmarkNotFoundException;
import com.taiso.bike_api.exception.ClubNotFoundException;
import com.taiso.bike_api.exception.UserNotFoundException;
import com.taiso.bike_api.repository.BookmarkRepository;
import com.taiso.bike_api.repository.ClubRepository;
import com.taiso.bike_api.repository.UserRepository;

@Service
public class BookmarkClubService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookmarkRepository bookmarkRepository;

    @Autowired
    private ClubRepository clubRepository;

    public BookmarkClubsGetResponseDTO getBookmarkClubs(int page, int size, String sort, String userEmail) {

        // 정렬 기준 설정
        Sort sortObj = Sort.unsorted();
        if (!sort.isEmpty()) {
            sortObj = Sort.by(sort).ascending();
        }

        // 페이지 요청 생성
        Pageable pageable = PageRequest.of(page, size, sortObj);

        // 사용자 조회
        UserEntity user = userRepository.findByEmail(userEmail).get();

        // 사용자가 북마크한 클럽리스트 조회
        Page<BookmarkEntity> bookmarkPage = bookmarkRepository.findByUserAndTargetType(user, BookmarkType.CLUB, pageable);

        // 북마크한 클럽상세리스트 조회
        Page<ClubEntity> clubPage = clubRepository.findAllByClubIdIn(bookmarkPage.stream().map(bookmark -> bookmark.getTargetId()).collect(Collectors.toList()), pageable);

        // 응답 DTO생성 - 빌더 패턴 사용
        List<BookmarkClubResponseDTO> clubDTO = clubPage.getContent().stream()
                .map(club -> {
                    // 기본 DTO 생성
                    BookmarkClubResponseDTO dto = BookmarkClubResponseDTO.builder()
                            .clubId(club.getClubId())
                            .clubProfileImageId(club.getClubProfileImageId())
                            .clubName(club.getClubName())
                            .clubLeaderId(club.getClubLeader().getUserId())
                            .clubLeaderName(club.getClubLeader().getUserDetail().getUserNickname())
                            .clubLeaderProfileImageId(club.getClubLeader().getUserDetail().getUserProfileImg())
                            .clubShortDescription(club.getClubShortDescription())
                            .maxScale(club.getMaxUser())
                            .currentScale(club.getUsers().stream().filter(member -> member.getParticipantStatus() == ParticipantStatus.완료 || member.getParticipantStatus() == ParticipantStatus.승인).collect(Collectors.toList()).size())
                            .tags(club.getTags().stream().map(tag -> tag.getName()).collect(Collectors.toSet()))
                            .isBookmarked(true)
                            .build();

                    return dto;
                })
                .collect(Collectors.toList());

        return BookmarkClubsGetResponseDTO.builder()
                .content(clubDTO)
                .pageNo(clubPage.getNumber() + 1)
                .pageSize(clubPage.getSize())
                .totalElements(clubPage.getTotalElements())
                .totalPages(clubPage.getTotalPages())
                .last(clubPage.isLast())
                .build();
    }

    public BookmarkClubCreateResponseDTO createBookmarkClub(Long clubId, Authentication authentication) {

        // 사용자 존재여부 확인
        UserEntity user = userRepository.findByEmail(authentication.getName()).orElseThrow(() ->
            new UserNotFoundException("존재하지 않는 사용자입니다.")
        );

        // 클럽 존재여부 확인
        ClubEntity club = clubRepository.findByClubId(clubId).orElseThrow(() ->
            new ClubNotFoundException("존재하지 않는 클럽입니다.")
        );

        // 북마크 존재여부 확인
        if (bookmarkRepository.existsByUserAndTargetIdAndTargetType(user, clubId, BookmarkType.CLUB)) {
            throw new BookmarkAlreadyExistsException("이미 북마크된 클럽입니다.");
        }

        // 엔티티 빌드 및 저장
        bookmarkRepository.save(BookmarkEntity.builder()
                      .user(user)
                      .targetId(club.getClubId())
                      .targetType(BookmarkType.CLUB)
                      .build());

        return BookmarkClubCreateResponseDTO.builder().message("북마크 등록이 완료되었습니다.").build();
    
    }

    public BookmarkClubDeleteResponseDTO deleteBookmarkClub(Long clubId, Authentication authentication) {
        
        // 사용자 존재여부 확인
        UserEntity user = userRepository.findByEmail(authentication.getName()).orElseThrow(() ->
            new UserNotFoundException("존재하지 않는 사용자입니다.")
        );

        // 클럽 존재여부 확인
        clubRepository.findByClubId(clubId).orElseThrow(() ->
            new ClubNotFoundException("존재하지 않는 클럽입니다.")
        );

        // 북마크 존재여부 확인
        BookmarkEntity bookmarkEntity = bookmarkRepository.
        		findByTargetIdAndUserAndTargetType(clubId, user, BookmarkType.CLUB);
        if (bookmarkEntity == null) {
            throw new BookmarkNotFoundException("존재하지 않는 북마크입니다.");
        }

        // 엔티티 빌드 및 저장
        bookmarkRepository.delete(bookmarkEntity);

        return BookmarkClubDeleteResponseDTO.builder().message("북마크 삭제가 완료되었습니다.").build();
    
    }
    
}
