package com.taiso.bike_api.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.taiso.bike_api.dto.BookmarkRouteListResponseDTO;
import com.taiso.bike_api.dto.BookmarkRouteResponseDTO;
import com.taiso.bike_api.dto.BookmarkUserListResponseDTO;
import com.taiso.bike_api.dto.BookmarkUserResponseDTO;
import com.taiso.bike_api.service.BookmarkRouteService;
import com.taiso.bike_api.service.BookmarkUserService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;

@RestController
@Slf4j
@RequestMapping("/api/users/me/bookmarks/route")
@Tag(name = "북마크 루트 컨트롤러", description = "북마크 루트 관련 API")
public class BookmarkRouteController {

    @Autowired
    private BookmarkRouteService bookmarkRouteService;

	// 북마크 루트 등록
	@PostMapping("/{routeId}")
  	@Operation(summary = "북마크 루트 등록", description = "북마크 루트 등록 API")
	public ResponseEntity<BookmarkRouteResponseDTO> bookmarkRouteCreate(
    		@PathVariable(name = "routeId") Long routeId,
			Authentication authentication
			) {
		bookmarkRouteService.bookmarkRouteCreate(routeId, authentication);
		
		return ResponseEntity.status(HttpStatus.CREATED).body(null);
	}

	// 북마크 루트 조회
	@GetMapping("")
  	@Operation(summary = "북마크 루트 조회", description = "북마크 루트 조회 API")
	public ResponseEntity<List<BookmarkRouteListResponseDTO>> BookmarkRouteList(
			Authentication authentication
			) {

		List<BookmarkRouteListResponseDTO> responseDTOs = bookmarkRouteService.bookmarkUserList(authentication);

		return  ResponseEntity.status(HttpStatus.OK).body(responseDTOs);
	}
	
	// 북마크 루트 삭제
	@DeleteMapping("/{routeId}")
  	@Operation(summary = "북마크 루트 삭제", description = "북마크 루트 삭제 API")
	public ResponseEntity<BookmarkRouteResponseDTO> BookmarkRouteDelete(
    		@PathVariable(name = "routeId") Long routeId,
			Authentication authentication
			) {
		bookmarkRouteService.bookmarkRouteDelete(routeId, authentication);

		return  ResponseEntity.status(HttpStatus.NO_CONTENT).body(null);
	}
	
	
	
}
