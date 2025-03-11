package com.taiso.bike_api.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import com.taiso.bike_api.domain.BookmarkEntity;
import com.taiso.bike_api.domain.BookmarkEntity.BookmarkType;
import com.taiso.bike_api.domain.RouteEntity;
import com.taiso.bike_api.domain.UserEntity;
import com.taiso.bike_api.dto.BookmarkRouteListResponseDTO;
import com.taiso.bike_api.exception.BookmarkAlreadyExistsException;
import com.taiso.bike_api.exception.BookmarkNotFoundException;
import com.taiso.bike_api.exception.UserNotFoundException;
import com.taiso.bike_api.repository.BookmarkRepository;
import com.taiso.bike_api.repository.RouteRepository;
import com.taiso.bike_api.repository.UserRepository;

import jakarta.transaction.Transactional;

@Service
public class BookmarkRouteService {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private BookmarkRepository bookmarkRepository;

    @Autowired
    private RouteRepository routeRepository;
    
	@Transactional
	public void bookmarkRouteCreate(Long routeId, Authentication authentication) {

        // 1. 유저 아이디로 엔티티 가져오기
        UserEntity currentUser = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new UserNotFoundException("로그인 사용자를 찾을 수 없습니다. NOT_FOUND"));  
        
        // 2. 루트 있는지 확인
        routeRepository.findById(routeId)
                .orElseThrow(() -> new BookmarkNotFoundException("루트 있는지 확인할 수 없습니다. NOT_FOUND")); 

        // 3. 이미 동일한 북마크가 존재하는지 확인
        if (bookmarkRepository.existsByUserAndTargetIdAndTargetType(currentUser, routeId, BookmarkType.ROUTE)) {
            throw new BookmarkAlreadyExistsException("이미 북마크가 된 루트 입니다.");
        }

        // 4. bookmarkEntity에 빌더
        BookmarkEntity bookmarkEntity = BookmarkEntity.builder()
    		.user(currentUser)
    		.targetType(BookmarkType.ROUTE)
    		.targetId(routeId)
    		.build();

        // 5. 저장
        bookmarkRepository.save(bookmarkEntity);
        
	}

	@Transactional
	public List<BookmarkRouteListResponseDTO> bookmarkUserList(Authentication authentication) {
		
        // 1. 유저 아이디로 엔티티 가져오기
        UserEntity currentUser = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new UserNotFoundException("로그인 사용자를 찾을 수 없습니다. NOT_FOUND"));  

        // 2. 유저 엔티티로 루트 북마크 가져오기
        List<BookmarkEntity> bookmarkEntity = bookmarkRepository.findByUserAndTargetType(currentUser, BookmarkType.ROUTE); 
        // 북마크가 존재하고 있지 않을 때 예외 처리 
        if (bookmarkEntity.isEmpty()) {
            throw new BookmarkNotFoundException("존재하지 않는 북마크입니다.");
        }
        // 북마크의 숫자 측정
        int totalBookmarkCount = bookmarkEntity.size();
        
     // 3. 각 북마크에 대해 UserDetailEntity 조회 후 DTO 생성
        List<BookmarkRouteListResponseDTO> responseDTOs = bookmarkEntity.stream()
        		.map((BookmarkEntity bookmark) -> 
        		{
                    RouteEntity routeEntity = routeRepository.findById(bookmark.getTargetId())
                            .orElseThrow(() -> new BookmarkNotFoundException("북마크된 사용자의 상세 정보를 찾을 수 없습니다."));
                        
                return  BookmarkRouteListResponseDTO.builder()
    		        .bookmarkId(bookmark.getBookmarkId())
    				.userId(currentUser.getUserId())
    				.bookmarkedRouteId(bookmark.getTargetId())
    				.totalBookmark(totalBookmarkCount)
    		        .createdAt(bookmark.getCreatedAt())
    		        
    		        .routeId(routeEntity.getRouteId())
    		        .routeImgId(routeEntity.getRouteImgId())
    		        .routeName(routeEntity.getRouteName())
    		        .likeCount(routeEntity.getLikeCount())
    		        .tags(routeEntity.getTags())
    		        .distance(routeEntity.getDistance())
    		        .altitude(routeEntity.getAltitude())
    		        .region(routeEntity.getRegion())
    		        .distanceType(routeEntity.getDistanceType())
    		        .altitudeType(routeEntity.getAltitudeType())
    		        .roadType(routeEntity.getRoadType())
    		        .bookmarkcreatedAt(routeEntity.getCreatedAt())
    		        
    				.build();

        		})
        		.collect(Collectors.toList());
        
		return responseDTOs;
	}

	// 북마크 루트 삭제
	@Transactional
	public void bookmarkRouteDelete(Long routeId, Authentication authentication) {
		

        // 1. 유저 아이디로 엔티티 가져오기
        UserEntity currentUser = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new UserNotFoundException("로그인 사용자를 찾을 수 없습니다. NOT_FOUND"));  

        // 2. 루트 있는지 확인
        routeRepository.findById(routeId)
                .orElseThrow(() -> new BookmarkNotFoundException("루트 있는지 확인할 수 없습니다. NOT_FOUND")); 

        // 3. 이미 동일한 북마크가 존재하는지 확인
        BookmarkEntity bookmarkEntity = bookmarkRepository.
        		findByTargetIdAndUserAndTargetType(routeId, currentUser, BookmarkType.ROUTE);
        if (bookmarkEntity == null) {
            throw new BookmarkNotFoundException("존재하지 않는 북마크입니다.");
        }

        // 4. 삭제
        bookmarkRepository.delete(bookmarkEntity);
	}
    
}
