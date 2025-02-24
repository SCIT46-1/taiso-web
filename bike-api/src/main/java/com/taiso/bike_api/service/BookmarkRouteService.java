package com.taiso.bike_api.service;

import com.taiso.bike_api.domain.BookmarkEntity;
import com.taiso.bike_api.domain.BookmarkEntity.BookmarkType;
import com.taiso.bike_api.domain.RouteEntity;
import com.taiso.bike_api.domain.UserEntity;
import com.taiso.bike_api.dto.BookmarkRouteDTO;
import com.taiso.bike_api.dto.BookmarkRouteListResponseDTO;
import com.taiso.bike_api.dto.BookmarkRouteResponseDTO;
import com.taiso.bike_api.repository.BookmarkRepository;
import com.taiso.bike_api.repository.RouteRepository;
import com.taiso.bike_api.repository.UserRepository;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
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
    
    
    // 북마크 루트 조회
    public BookmarkRouteListResponseDTO getBookmarkRoutes(String reviewerEmail) {
        // 1. 현재 북마크 등록자(사용자) 조회
        UserEntity user = userRepository.findByEmail(reviewerEmail)
                .orElseThrow(() -> new IllegalArgumentException("토큰이 존재하지 않습니다."));

        // 2. 현재 사용자가 북마크한 루트(타깃 타입: ROUTE) 조회
        List<BookmarkEntity> bookmarks = bookmarkRepository.findByUserAndTargetType(user, BookmarkType.ROUTE);

        // 3. 각 북마크에 대해 RouteEntity의 정보를 조회하여 DTO로 매핑
        List<BookmarkRouteDTO> dtoList = bookmarks.stream().map(bookmark -> {
            RouteEntity route = routeRepository.findById(bookmark.getTargetId())
                    .orElseThrow(() -> new IllegalArgumentException("대상 루트를 찾을 수 없습니다."));
            // RouteEntity의 태그를 List<String>으로 매핑 (각 태그의 이름 추출)
            List<String> tagNames = route.getTags().stream()
                    .map(tag -> tag.getName()) // RouteTagCategoryEntity의 getName() 메서드 사용
                    .collect(Collectors.toList());

            return BookmarkRouteDTO.builder()
                    .bookmarkId(bookmark.getBookmarkId())
                    .bookmarkDate(bookmark.getCreatedAt())
                    .routeId(route.getRouteId())
                    .routeName(route.getRouteName())
                    .description(route.getDescription())
                    .likeCount(route.getLikeCount())
                    .tag(tagNames)
                    .region(route.getRegion().toString())
                    .distance(route.getDistance())
                    .build();
        }).collect(Collectors.toList());

        return BookmarkRouteListResponseDTO.builder()
                .userId(user.getUserId())
                .bookmarkRoutes(dtoList)
                .build();
    }


}
