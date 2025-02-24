package com.taiso.bike_api.service;

import com.taiso.bike_api.domain.BookmarkEntity;
import com.taiso.bike_api.domain.BookmarkEntity.BookmarkType;
import com.taiso.bike_api.domain.RouteEntity;
import com.taiso.bike_api.domain.UserEntity;
import com.taiso.bike_api.dto.BookmarkRouteResponseDTO;
import com.taiso.bike_api.repository.BookmarkRepository;
import com.taiso.bike_api.repository.RouteRepository;
import com.taiso.bike_api.repository.UserRepository;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class BookmarkRouteService {

    private final BookmarkRepository bookmarkRepository;
    private final UserRepository userRepository;
    private final RouteRepository routeRepository;

    @Autowired
    public BookmarkRouteService(BookmarkRepository bookmarkRepository,
                                UserRepository userRepository,
                                RouteRepository routeRepository) {
        this.bookmarkRepository = bookmarkRepository;
        this.userRepository = userRepository;
        this.routeRepository = routeRepository;
    }

    // 북마크 루트 등록
    public BookmarkRouteResponseDTO createBookmark(Long routeId, String reviewerEmail) {
        // 1. 현재 북마크 등록자(사용자) 조회
        UserEntity user = userRepository.findByEmail(reviewerEmail)
                .orElseThrow(() -> new IllegalArgumentException("토큰이 존재하지 않습니다."));

        // 2. 대상 루트 존재 여부 확인
        RouteEntity route = routeRepository.findById(routeId)
                .orElseThrow(() -> new IllegalArgumentException("대상 루트를 찾을 수 없습니다."));

        // 3. 이미 북마크한 루트인지 확인
        Optional<BookmarkEntity> existing = bookmarkRepository.findByUserAndTargetTypeAndTargetId(user, BookmarkType.ROUTE, routeId);
        if (existing.isPresent()) {
            throw new IllegalArgumentException("이미 북마크한 루트입니다.");
        }

        // 4. 북마크 엔티티 생성 및 저장
        BookmarkEntity bookmark = BookmarkEntity.builder()
                .user(user)
                .targetType(BookmarkType.ROUTE)
                .targetId(routeId)
                .build();
        bookmarkRepository.save(bookmark);

        // 5. 응답 DTO 구성
        return BookmarkRouteResponseDTO.builder()
                .bookmarkId(bookmark.getBookmarkId())
                .userId(user.getUserId())
                .routeId(route.getRouteId())
                .createdAt(bookmark.getCreatedAt())
                .build();
    }
}
