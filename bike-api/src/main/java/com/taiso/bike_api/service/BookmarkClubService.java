package com.taiso.bike_api.service;

import com.taiso.bike_api.domain.BookmarkEntity;
import com.taiso.bike_api.domain.BookmarkEntity.BookmarkType;
import com.taiso.bike_api.domain.ClubEntity;
import com.taiso.bike_api.domain.UserEntity;
import com.taiso.bike_api.dto.BookmarkClubDTO;
import com.taiso.bike_api.dto.BookmarkClubListResponseDTO;
import com.taiso.bike_api.dto.BookmarkClubResponseDTO;
import com.taiso.bike_api.repository.BookmarkRepository;
import com.taiso.bike_api.repository.ClubRepository;
import com.taiso.bike_api.repository.UserRepository;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class BookmarkClubService {

    private final BookmarkRepository bookmarkRepository;
    private final UserRepository userRepository;
    private final ClubRepository clubRepository;

    @Autowired
    public BookmarkClubService(BookmarkRepository bookmarkRepository,
                               UserRepository userRepository,
                               ClubRepository clubRepository) {
        this.bookmarkRepository = bookmarkRepository;
        this.userRepository = userRepository;
        this.clubRepository = clubRepository;
    }


    // 북마크 클럽 등록
    public BookmarkClubResponseDTO createBookmarkClub(Long clubId, String reviewerEmail) {
        // 1. 현재 북마크 등록자(사용자) 조회
        UserEntity user = userRepository.findByEmail(reviewerEmail)
                .orElseThrow(() -> new IllegalArgumentException("토큰이 존재하지 않습니다."));

        // 2. 대상 클럽 존재 여부 확인
        ClubEntity club = clubRepository.findById(clubId)
                .orElseThrow(() -> new IllegalArgumentException("대상 클럽을 찾을 수 없습니다."));

        // 3. 이미 북마크한 클럽인지 확인
        Optional<BookmarkEntity> existing = bookmarkRepository.findByUserAndTargetTypeAndTargetId(user, BookmarkType.CLUB, clubId);
        if (existing.isPresent()) {
            throw new IllegalArgumentException("이미 북마크한 클럽입니다.");
        }

        // 4. 북마크 엔티티 생성 및 저장
        BookmarkEntity bookmark = BookmarkEntity.builder()
                .user(user)
                .targetType(BookmarkType.CLUB)
                .targetId(clubId)
                .build();
        bookmarkRepository.save(bookmark);

        // 5. 응답 DTO 구성
        return BookmarkClubResponseDTO.builder()
                .bookmarkId(bookmark.getBookmarkId())
                .userId(user.getUserId())
                .clubId(club.getClubId())
                .createdAt(bookmark.getCreatedAt())
                .build();
    }


    // 북마크 클럽 조회
    public BookmarkClubListResponseDTO getBookmarkedClubs(String reviewerEmail) {
        // 1. 현재 북마크 등록자(사용자) 조회
        UserEntity user = userRepository.findByEmail(reviewerEmail)
                .orElseThrow(() -> new IllegalArgumentException("토큰이 존재하지 않습니다."));

        // 2. 현재 사용자가 북마크한 클럽 북마크 조회 (타깃 타입이 CLUB)
        List<BookmarkEntity> bookmarks = bookmarkRepository.findByUserAndTargetType(user, BookmarkType.CLUB);

        // 3. 각 북마크에 대해 대상 클럽 정보를 조회하여 DTO 매핑
        List<BookmarkClubDTO> bookmarkClubList = bookmarks.stream().map(bookmark -> {
            ClubEntity club = clubRepository.findById(bookmark.getTargetId())
                    .orElseThrow(() -> new IllegalArgumentException("대상 클럽을 찾을 수 없습니다."));
            return BookmarkClubDTO.builder()
                    .bookmarkId(bookmark.getBookmarkId())
                    .bookmarkDate(bookmark.getCreatedAt())
                    .clubId(club.getClubId())
                    .clubName(club.getClubName())
                    .clubShortDescription(club.getClubShortDescription())
                    .maxUser(club.getMaxUser())
                    .build();
        }).collect(Collectors.toList());

        return BookmarkClubListResponseDTO.builder()
                .userId(user.getUserId())
                .bookmarkClub(bookmarkClubList)
                .build();
    }

    // 북마크 클럽 취소
    public void cancelBookmarkClub(Long clubId, String reviewerEmail) {
        // 현재 북마크 등록자(사용자) 조회
        UserEntity user = userRepository.findByEmail(reviewerEmail)
                .orElseThrow(() -> new IllegalArgumentException("토큰이 존재하지 않습니다."));

        // 북마크 대상이 CLUB인 북마크가 존재하는지 확인
        Optional<BookmarkEntity> bookmarkOpt = bookmarkRepository.findByUserAndTargetTypeAndTargetId(user, BookmarkType.CLUB, clubId);
        if (!bookmarkOpt.isPresent()) {
            throw new IllegalArgumentException("북마크한 게시글이 아닙니다.");
        }

        // 북마크 삭제
        bookmarkRepository.delete(bookmarkOpt.get());
    }

}
