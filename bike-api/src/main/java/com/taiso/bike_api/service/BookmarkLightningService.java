package com.taiso.bike_api.service;

import com.taiso.bike_api.domain.BookmarkEntity;
import com.taiso.bike_api.domain.BookmarkEntity.BookmarkType;
import com.taiso.bike_api.domain.LightningEntity;
import com.taiso.bike_api.domain.UserEntity;
import com.taiso.bike_api.dto.BookmarkLightningDTO;
import com.taiso.bike_api.dto.BookmarkLightningResponseDTO;
import com.taiso.bike_api.dto.BookmarkLightningListResponseDTO;

import com.taiso.bike_api.repository.BookmarkRepository;
import com.taiso.bike_api.repository.LightningRepository;
import com.taiso.bike_api.repository.UserRepository;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class BookmarkLightningService {

    private final BookmarkRepository bookmarkRepository;
    private final LightningRepository lightningRepository;
    private final UserRepository userRepository;

    @Autowired
    public BookmarkLightningService(BookmarkRepository bookmarkRepository,
                                    LightningRepository lightningRepository,
                                    UserRepository userRepository) {
        this.bookmarkRepository = bookmarkRepository;
        this.lightningRepository = lightningRepository;
        this.userRepository = userRepository;
    }

    
    // 북마크 번개 등록
    public BookmarkLightningResponseDTO createBookmark(Long lightningId, String reviewerEmail) {
        // 1. 현재 북마크 등록자(사용자) 조회
        UserEntity user = userRepository.findByEmail(reviewerEmail)
                .orElseThrow(() -> new IllegalArgumentException("토큰이 존재하지 않습니다."));

        // 2. 번개 이벤트 존재 여부 확인
        LightningEntity lightning = lightningRepository.findById(lightningId)
                .orElseThrow(() -> new IllegalArgumentException("대상 번개를 찾을 수 없습니다."));

        // 3. 이미 북마크한 번개인지 확인
        Optional<BookmarkEntity> existing = bookmarkRepository.findByUserAndTargetTypeAndTargetId(user, BookmarkType.LIGHTNING, lightningId);
        if (existing.isPresent()) {
            throw new IllegalArgumentException("이미 북마크한 번개입니다.");
        }

        // 4. 북마크 엔티티 생성 및 저장
        BookmarkEntity bookmark = BookmarkEntity.builder()
                .user(user)
                .targetType(BookmarkType.LIGHTNING)
                .targetId(lightningId)
                .build();
        bookmarkRepository.save(bookmark);

        // 5. 응답 DTO 구성
        return BookmarkLightningResponseDTO.builder()
                .bookmarkId(bookmark.getBookmarkId())
                .userId(user.getUserId())
                .lightningId(lightning.getLightningId())
                .createdAt(bookmark.getCreatedAt())
                .build();
    }
    
    // 북마크 번개 조회
    public BookmarkLightningListResponseDTO getBookmarkLightnings(String reviewerEmail) {
        // 1. 현재 북마크 등록자(사용자) 조회
        UserEntity user = userRepository.findByEmail(reviewerEmail)
                .orElseThrow(() -> new IllegalArgumentException("토큰이 존재하지 않습니다."));

        // 2. 현재 사용자가 북마크한 번개 이벤트 조회 (타깃 타입이 LIGHTNING)
        List<BookmarkEntity> bookmarks = bookmarkRepository.findByUserAndTargetType(user, BookmarkType.LIGHTNING);

        // 3. 각 북마크에 대해 대상 번개 이벤트를 조회하여 DTO로 매핑
        List<BookmarkLightningDTO> dtoList = bookmarks.stream().map(bookmark -> {
            LightningEntity lightning = lightningRepository.findById(bookmark.getTargetId())
                    .orElseThrow(() -> new IllegalArgumentException("대상 번개를 찾을 수 없습니다."));

            return BookmarkLightningDTO.builder()
                    .bookmarkId(bookmark.getBookmarkId())
                    .bookmarkDate(bookmark.getCreatedAt())
                    .lightningId(lightning.getLightningId())
                    .title(lightning.getTitle())
                    .eventDate(lightning.getEventDate())
                    .duration(lightning.getDuration())
                    .status(lightning.getStatus().toString())
                    .latitude(lightning.getLatitude())
                    .longitude(lightning.getLongitude())
                    .capacity(lightning.getCapacity())
                    .gender(lightning.getGender().toString())
                    .level(lightning.getLevel().toString())
                    .build();
        }).collect(Collectors.toList());

        return BookmarkLightningListResponseDTO.builder()
                .userId(user.getUserId())
                .bookmarkedLightnings(dtoList)
                .build();
    }

}
