package com.taiso.bike_api.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.taiso.bike_api.domain.BookmarkEntity;
import com.taiso.bike_api.domain.BookmarkEntity.BookmarkType;
import com.taiso.bike_api.domain.UserEntity;

@Repository
public interface BookmarkRepository extends JpaRepository<BookmarkEntity, Long> {

	// 유저 북마크 등록 검증
	boolean existsByUserAndTargetIdAndTargetType(UserEntity currentUser, Long userId, BookmarkType user);

	// 유저 북마크 조회
	List<BookmarkEntity> findByUserAndTargetType(UserEntity currentUser, BookmarkType user);

	// 유저 북마크 삭제
	BookmarkEntity findByTargetIdAndUserAndTargetType(Long userId, UserEntity currentUser, BookmarkType user);

}
