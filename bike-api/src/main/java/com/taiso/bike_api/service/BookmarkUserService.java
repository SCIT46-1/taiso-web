package com.taiso.bike_api.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import com.taiso.bike_api.domain.BookmarkEntity;
import com.taiso.bike_api.domain.BookmarkEntity.BookmarkType;
import com.taiso.bike_api.domain.UserDetailEntity;
import com.taiso.bike_api.domain.UserEntity;
import com.taiso.bike_api.dto.BookmarkUserListResponseDTO;
import com.taiso.bike_api.exception.BookmarkAlreadyExistsException;
import com.taiso.bike_api.exception.BookmarkNotFoundException;
import com.taiso.bike_api.exception.SelfBookmarkException;
import com.taiso.bike_api.exception.UserNotFoundException;
import com.taiso.bike_api.repository.BookmarkRepository;
import com.taiso.bike_api.repository.UserDetailRepository;
import com.taiso.bike_api.repository.UserRepository;

import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class BookmarkUserService {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private BookmarkRepository bookmarkRepository;

    @Autowired
    private UserDetailRepository userDetailRepository;
    
	@Transactional
	public void bookmarkUserCreate(Long userId, Authentication authentication) {
		
        // 1. 유저 아이디로 엔티티 가져오기
        UserEntity currentUser = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new UserNotFoundException("로그인 사용자를 찾을 수 없습니다. NOT_FOUND"));  

        // 2. 북마크 당하는 사람
        UserEntity targetUser = userRepository.findById(userId)
            .orElseThrow(() -> new UserNotFoundException("북마크 대상 사용자를 찾을 수 없습니다. NOT_FOUND")); 
        
        // 3. 자기 자신을 북마크할 수 없도록 방지
        if (currentUser.getUserId().equals(targetUser.getUserId())) {
            throw new SelfBookmarkException("자기 자신은 북마크할 수 없습니다.");
        }

        // 4. 이미 동일한 북마크가 존재하는지 확인
        if (bookmarkRepository.existsByUserAndTargetIdAndTargetType(currentUser, userId, BookmarkType.USER)) {
            throw new BookmarkAlreadyExistsException("이미 북마크된 사용자입니다.");
        }
        
        // 5. bookmarkEntity에 빌더
        BookmarkEntity bookmarkEntity = BookmarkEntity.builder()
    		.user(currentUser)
    		.targetType(BookmarkType.USER)
    		.targetId(userId)
    		.build();
        
        // 4. 저장
        bookmarkRepository.save(bookmarkEntity);
        
	}

	// 북마크 회원 조회
	@Transactional
	public List<BookmarkUserListResponseDTO> bookmarkUserList(Authentication authentication) {

        // 1. 유저 아이디로 엔티티 가져오기
        UserEntity currentUser = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new UserNotFoundException("로그인 사용자를 찾을 수 없습니다. NOT_FOUND"));  

        // 2. 유저 엔티티로 유저 북마크 가져오기
        List<BookmarkEntity> bookmarkEntity = bookmarkRepository.findByUserAndTargetType(currentUser, BookmarkType.USER); 
        // 북마크가 존재하고 있지 않을 때 예외 처리 
        if (bookmarkEntity == null) {
            throw new BookmarkNotFoundException("존재하지 않는 북마크입니다.");
        }
        // 북마크의 숫자 측정
        int totalBookmarkCount = bookmarkEntity.size();

        // 3. 각 북마크에 대해 UserDetailEntity 조회 후 DTO 생성
        List<BookmarkUserListResponseDTO> responseDTOs = bookmarkEntity.stream()
        		.map((BookmarkEntity bookmark) -> 
        		{
                    UserDetailEntity userDetail = userDetailRepository.findByUserId(bookmark.getTargetId())
                            .orElseThrow(() -> new UserNotFoundException("북마크된 사용자의 상세 정보를 찾을 수 없습니다."));
                        
                return  BookmarkUserListResponseDTO.builder()
    				.userId(currentUser.getUserId())
    				.bookmarkedUserId(bookmark.getTargetId())
    				.totalBookmark(totalBookmarkCount)
    		        .createdAt(bookmark.getCreatedAt())
    		        .userNickname(userDetail.getUserNickname())
    		        .userProfileImg(userDetail.getUserProfileImg())
    		        .gender(userDetail.getGender())
    		        .level(userDetail.getLevel())
    				.build();

        		})
        		.collect(Collectors.toList());

        return responseDTOs;
	}

	// 북마크 회원 삭제
	@Transactional
	public void bookmarkUserDelete(Long userId, Authentication authentication) {

        // 1. 유저 아이디로 엔티티 가져오기
        UserEntity currentUser = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new UserNotFoundException("로그인 사용자를 찾을 수 없습니다. NOT_FOUND"));  

        // 2. 북마크 당하는 사람 있는지 확인
        userRepository.findById(userId)
            .orElseThrow(() -> new UserNotFoundException("북마크 대상 사용자를 찾을 수 없습니다. NOT_FOUND")); 

        // 3. 북마크 있는지 확인, 예외 처리
        BookmarkEntity bookmarkEntity = bookmarkRepository.
        		findByTargetIdAndUserAndTargetType(userId, currentUser, BookmarkType.USER);
        if (bookmarkEntity == null) {
            throw new BookmarkNotFoundException("존재하지 않는 북마크입니다.");
        }
         
        // 4. 삭제
        bookmarkRepository.delete(bookmarkEntity);
	}
	
	
	
	

}
