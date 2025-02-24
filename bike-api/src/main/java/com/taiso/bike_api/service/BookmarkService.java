package com.taiso.bike_api.service;

import com.taiso.bike_api.domain.BookmarkEntity;
import com.taiso.bike_api.domain.BookmarkEntity.BookmarkType;
import com.taiso.bike_api.domain.UserEntity;
import com.taiso.bike_api.dto.BookmarkResponseDTO;
import com.taiso.bike_api.repository.BookmarkRepository;
import com.taiso.bike_api.repository.UserRepository;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class BookmarkService {

    private final BookmarkRepository bookmarkRepository;
    private final UserRepository userRepository;

    @Autowired
    public BookmarkService(BookmarkRepository bookmarkRepository, UserRepository userRepository) {
        this.bookmarkRepository = bookmarkRepository;
        this.userRepository = userRepository;
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
}
