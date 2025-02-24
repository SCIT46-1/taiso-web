package com.taiso.bike_api.repository;

import com.taiso.bike_api.domain.BookmarkEntity;
import com.taiso.bike_api.domain.BookmarkEntity.BookmarkType;
import com.taiso.bike_api.domain.UserEntity;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BookmarkRepository extends JpaRepository<BookmarkEntity, Long> {
    Optional<BookmarkEntity> findByUserAndTargetTypeAndTargetId(UserEntity user, BookmarkType targetType, Long targetId);
    // 특정 대상 회원(타깃 유저)에 대해 북마크된 횟수를 반환
    Long countByTargetTypeAndTargetId(BookmarkType targetType, Long targetId);

    // 현재 사용자가 북마크한 대상들을 조회 (타깃이 USER인 경우)
    List<BookmarkEntity> findByUserAndTargetType(UserEntity user, BookmarkType targetType);
}
