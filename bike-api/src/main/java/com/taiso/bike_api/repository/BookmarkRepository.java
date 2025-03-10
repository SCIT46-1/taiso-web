package com.taiso.bike_api.repository;


import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.taiso.bike_api.domain.BookmarkEntity;
import com.taiso.bike_api.domain.BookmarkEntity.BookmarkType;
import com.taiso.bike_api.domain.RouteEntity;
import com.taiso.bike_api.domain.UserEntity;

@Repository
public interface BookmarkRepository extends JpaRepository<BookmarkEntity, Long> {

	// 북마크 등록 검증
	boolean existsByUserAndTargetIdAndTargetType(UserEntity currentUser, Long targetId, BookmarkType type);

	// 북마크 조회
	List<BookmarkEntity> findByUserAndTargetType(UserEntity currentUser, BookmarkType type);

	// 북마크 삭제
	BookmarkEntity findByTargetIdAndUserAndTargetType(Long targetId, UserEntity currentUser, BookmarkType type);

	// 통합 북마크 삭제
	BookmarkEntity findByBookmarkIdAndUser(Long bookmarkId, UserEntity user);

	// 루트 디테일 북마크 확인
	boolean existsByUser_UserIdAndTargetIdAndTargetType(Long userId, Long routeId, BookmarkType route);

	// Add this method matching your entity structure
	boolean existsByUser_UserIdAndTargetIdAndTargetType(Long userId, Long lightningId, BookmarkType type);
	
	// 추가할 메서드 - 수정됨
	boolean existsByTargetIdAndUser_UserId(Long targetId, Long userId);
	
}
