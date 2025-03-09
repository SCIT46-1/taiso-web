package com.taiso.bike_api.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.taiso.bike_api.dto.BookmarkUserDeleteResponseDTO;
import com.taiso.bike_api.dto.BookmarkUserListResponseDTO;
import com.taiso.bike_api.dto.BookmarkUserResponseDTO;
import com.taiso.bike_api.service.BookmarkUserService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;

@RestController
@Slf4j
@RequestMapping("/api/users/me/bookmarks/users")
@Tag(name = "북마크 유저 컨트롤러", description = "북마크 유저 관련 API")
public class BookmarkUserController {

    @Autowired
    private BookmarkUserService bookmarkUserService;

	// 북마크 회원 등록
	@PostMapping("/{userId}")
  	@Operation(summary = "북마크 회원 등록", description = "북마크 회원 등록 API")
	public ResponseEntity<BookmarkUserResponseDTO> bookmarkUserCreate(
    		@PathVariable(name = "userId") Long userId,
			Authentication authentication
			) {

		bookmarkUserService.bookmarkUserCreate(userId, authentication);

		return ResponseEntity.status(HttpStatus.CREATED).body(null);
	}
	
	// 북마크 회원 조회
	@GetMapping("/{userId}")
  	@Operation(summary = "북마크 회원 조회", description = "북마크 회원 조회 API")
	public ResponseEntity<List<BookmarkUserListResponseDTO>> BookmarkUserList(
			Authentication authentication
			) {
		
		List<BookmarkUserListResponseDTO> responseDTOs = bookmarkUserService.bookmarkUserList(authentication);
		
		return  ResponseEntity.status(HttpStatus.OK).body(responseDTOs);
	}
	
	// 북마크 회원 삭제
	@DeleteMapping("/{userId}")
  	@Operation(summary = "북마크 회원 삭제", description = "북마크 회원 삭제 API")
	public ResponseEntity<BookmarkUserDeleteResponseDTO> BookmarkUserDelete(
    		@PathVariable(name = "userId") Long userId,
			Authentication authentication
			) {
		bookmarkUserService.bookmarkUserDelete(userId, authentication);
		
		return  ResponseEntity.status(HttpStatus.NO_CONTENT).body(null);
	}
	
	
}
