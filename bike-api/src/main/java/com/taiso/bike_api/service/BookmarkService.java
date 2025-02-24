package com.taiso.bike_api.service;

import com.taiso.bike_api.domain.BookmarkEntity;
import com.taiso.bike_api.domain.BookmarkEntity.BookmarkType;
import com.taiso.bike_api.domain.UserEntity;
import com.taiso.bike_api.domain.UserDetailEntity;
import com.taiso.bike_api.dto.BookmarkResponseDTO;
import com.taiso.bike_api.dto.BookmarkUserListResponseDTO;
import com.taiso.bike_api.dto.BookmarkUserResponseDTO;
import com.taiso.bike_api.repository.BookmarkRepository;
import com.taiso.bike_api.repository.UserDetailRepository;
import com.taiso.bike_api.repository.UserRepository;
import java.util.Optional;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class BookmarkService {

    private final BookmarkRepository bookmarkRepository;
    private final UserRepository userRepository;
    private final UserDetailRepository userDetailRepository;

    @Autowired
    public BookmarkService(BookmarkRepository bookmarkRepository,
                           UserRepository userRepository,
                           UserDetailRepository userDetailRepository) {
        this.bookmarkRepository = bookmarkRepository;
        this.userRepository = userRepository;
        this.userDetailRepository = userDetailRepository;
    }

    // 북마크 회원 등록
    public BookmarkResponseDTO createBookmark(Long targetUserId, String reviewerEmail) {
        // 현재 북마크를 등록하는 사용자 조회 (로그인한 사용자)
        UserEntity user = userRepository.findByEmail(reviewerEmail)
                .orElseThrow(() -> new IllegalArgumentException("북마크 요청이 잘못됐습니다."));

        // 타깃 유저(북마크 대상) 존재 여부 확인
        UserEntity targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new IllegalArgumentException("대상 회원을 찾을 수 없습니다."));

        // 이미 북마크한 회원인지 확인
        Optional<BookmarkEntity> existingBookmark = bookmarkRepository.findByUserAndTargetTypeAndTargetId(user, BookmarkType.USER, targetUserId);
        if (existingBookmark.isPresent()) {
            throw new IllegalArgumentException("이미 북마크한 회원입니다.");
        }

        // 북마크 엔티티 생성 및 저장
        BookmarkEntity bookmark = BookmarkEntity.builder()
                .user(user)
                .targetType(BookmarkType.USER)
                .targetId(targetUserId)
                .build();
        bookmarkRepository.save(bookmark);

        return BookmarkResponseDTO.builder()
                .bookmarkId(bookmark.getBookmarkId())
                .userId(user.getUserId())
                .targetUserId(targetUserId)
                .createdAt(bookmark.getCreatedAt())
                .build();
    }

    // 북마크 회원 조회
    public BookmarkUserListResponseDTO getBookmarkedUsers(String reviewerEmail) {
        // 1. 현재 북마크 등록자(사용자) 조회
        UserEntity user = userRepository.findByEmail(reviewerEmail)
                .orElseThrow(() -> new IllegalArgumentException("토큰이 존재하지 않습니다."));

        // 2. 현재 사용자가 북마크한 대상(타깃이 USER인 경우) 조회
        List<BookmarkEntity> bookmarks = bookmarkRepository.findByUserAndTargetType(user, BookmarkType.USER);
        if (bookmarks.isEmpty()) {
            throw new IllegalArgumentException("북마크 해당 유저가 존재하지 않습니다.");
        }

        // 3. 각 북마크에 대해 대상 회원의 상세 정보 및 전체 북마크 수 조회 후 DTO 매핑
        List<BookmarkUserResponseDTO> bookmarkedUsers = bookmarks.stream().map(bookmark -> {
            Long targetUserId = bookmark.getTargetId();
            // 대상 회원의 상세 정보 조회
            UserDetailEntity detail = userDetailRepository.findById(targetUserId)
                    .orElseThrow(() -> new IllegalArgumentException("대상 회원을 찾을 수 없습니다."));

            // 전체 북마크 수 조회: 해당 대상이 USER 타입으로 북마크된 횟수
            Long totalBookmarks = bookmarkRepository.countByTargetTypeAndTargetId(BookmarkType.USER, targetUserId);

            // Gender, Level 등은 domain의 enum을 그대로 문자열로 변환하거나, 필요 시 매핑
            String gender = detail.getGender().toString();  // 예: "남자" → 원하는 경우 "남성"으로 변환 가능
            String level = detail.getLevel().toString();     // 예: "초보자", "입문자" 등

            return BookmarkUserResponseDTO.builder()
                    .userId(detail.getUserId())
                    .userNickname(detail.getUserNickname())
                    .userProfileImg(detail.getUserProfileImg())
                    .createdAt(bookmark.getCreatedAt())
                    .gender(gender)
                    .level(level)
                    .totalBookmarks(totalBookmarks)
                    .build();
        }).collect(Collectors.toList());

        return BookmarkUserListResponseDTO.builder()
                .userId(user.getUserId())
                .bookmarkedUsers(bookmarkedUsers)
                .build();
    }
}
