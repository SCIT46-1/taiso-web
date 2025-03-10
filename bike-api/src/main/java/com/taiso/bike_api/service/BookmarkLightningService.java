package com.taiso.bike_api.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import com.taiso.bike_api.domain.BookmarkEntity;
import com.taiso.bike_api.domain.LightningEntity;
import com.taiso.bike_api.domain.LightningTagCategoryEntity;
import com.taiso.bike_api.domain.UserEntity;
import com.taiso.bike_api.dto.BookmarkLightningResponseDTO;
import com.taiso.bike_api.exception.BookmarkAlreadyExistsException;
import com.taiso.bike_api.exception.BookmarkNotFoundException;
import com.taiso.bike_api.exception.LightningNotFoundException;
import com.taiso.bike_api.exception.UserNotFoundException;

import com.taiso.bike_api.repository.BookmarkRepository;
import com.taiso.bike_api.repository.LightningRepository;
import com.taiso.bike_api.repository.UserRepository;

import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class BookmarkLightningService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LightningRepository lightningRepository;

    @Autowired
    private BookmarkRepository bookmarkRepository;

    // 북마크 번개 생성
    @Transactional
    public void bookmarkLightningCreate(Long lightningId, Authentication authentication) {

        //유저 아이디 조회
        UserEntity user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new UserNotFoundException("로그인 사용자를 찾을 수 없습니다"));

        //북마크 할 번개
        LightningEntity targetLightning = lightningRepository.findById(lightningId)
                .orElseThrow(() -> new LightningNotFoundException("해당 번개를 찾을 수 없습니다."));

        //중복 북마크 방지
        if (bookmarkRepository.existsByUserAndTargetIdAndTargetType(
                user, targetLightning.getLightningId(), BookmarkEntity.BookmarkType.LIGHTNING)) {
            throw new BookmarkAlreadyExistsException("이미 북마크된 번개입니다.");
        }

        //빌더
        BookmarkEntity bookmarkLightning = BookmarkEntity.builder()
                .user(user)
                .targetType(BookmarkEntity.BookmarkType.LIGHTNING)
                .targetId(targetLightning.getLightningId())
                .build();

        //저장
        bookmarkRepository.save(bookmarkLightning);
    }

    // 북마크 번개 조회
    @Transactional
    public List<BookmarkLightningResponseDTO> bookmarkLightningList(Authentication authentication) {

        //유저 아이디 조회
        UserEntity user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new UserNotFoundException("로그인 사용자를 찾을 수 없습니다"));

        //유저 아이디로 북마크 조회
        List<BookmarkEntity> bookmarkEntity = bookmarkRepository.findByUserAndTargetType(user, BookmarkEntity.BookmarkType.LIGHTNING);
        //북마크 = 0 예외처리
        if (bookmarkEntity == null) {
            throw new BookmarkNotFoundException("북마크가 존재하지 않습니다.");
        }

        // 각 북마크 번개 조회
        List<BookmarkLightningResponseDTO> lightningList = bookmarkEntity.stream()
                .map((BookmarkEntity bookmark) ->
                {
                    LightningEntity lightning = lightningRepository.findById(bookmark.getTargetId())
                            .orElseThrow(() -> new UserNotFoundException("북마크된 번개를 찾을 수 없습니다."));

                    return BookmarkLightningResponseDTO.builder()
                            .lightningId(lightning.getLightningId())
                            .creatorId(lightning.getCreatorId())
                            .title(lightning.getTitle())
                            .eventDate(lightning.getEventDate())
                            .duration(lightning.getDuration())
                            .createdAt(lightning.getCreatedAt())
                            .status(lightning.getStatus())
                            .capacity(lightning.getCapacity())
                            .gender(lightning.getGender())
                            .level(lightning.getLevel())
                            .bikeType(lightning.getBikeType())
                            .tags(lightning.getTags().stream()
                                    .map(LightningTagCategoryEntity::getName)
                                    .collect(Collectors.toList()))
                            .address(lightning.getAddress())
                            .routeImgId(lightning.getRoute() != null ? lightning.getRoute().getRouteImgId() : null)
                            .joinedAt(bookmark.getCreatedAt())
                            .build();
                })
                .collect(Collectors.toList());

        return lightningList;
    }

    // 북마크 삭제
    @Transactional
    public void bookmarkLightningDelete(Long lightningId, Authentication authentication) {

        //유저 아이디 조회
        UserEntity user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new UserNotFoundException("로그인 사용자를 찾을 수 없습니다"));

        //해당 북마크 조회
        BookmarkEntity bookmarkEntity = bookmarkRepository.findByTargetIdAndUserAndTargetType(lightningId, user, BookmarkEntity.BookmarkType.LIGHTNING);
        if (bookmarkEntity == null) {
            throw new BookmarkNotFoundException("존재하지 않는 북마크입니다.");
        }

        // 해당방식으로 진행하는 경우 유저가 그 북마크의 주인인지도 검증하는 과정 필요해보임.

        // 삭제
        bookmarkRepository.delete(bookmarkEntity);
    }
}
