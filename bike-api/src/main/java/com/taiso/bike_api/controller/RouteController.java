package com.taiso.bike_api.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.taiso.bike_api.dto.RouteDetailResponseDTO;
import com.taiso.bike_api.dto.RouteLikePostResponseDTO;
import com.taiso.bike_api.dto.RouteListResponseDTO;
import com.taiso.bike_api.dto.RoutePostRequestDTO;
import com.taiso.bike_api.dto.RoutePostResponseDTO;
import com.taiso.bike_api.service.RouteCreateService;
import com.taiso.bike_api.service.RouteService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;

@RestController
@Slf4j
@RequestMapping("/api/routes")
@Tag(name = "루트 컨트롤러", description = "루트 관련 API")
public class RouteController {

    @Autowired
    private RouteService routeService;
    
    @Autowired
    private RouteCreateService routeCreateService;


    // 루트 디테일 조회
    @GetMapping("/{routeId}")
    @Operation(summary = "루트 디테일 조회", description = "루트 디테일 조회하는 API")
    public ResponseEntity<RouteDetailResponseDTO> getRoute(@PathVariable(name = "routeId") Long routeId,
            Authentication authentication) {
        String userEmail = null;
        if (authentication != null) {
            userEmail = authentication.getName();
        }

        RouteDetailResponseDTO route = routeService.getRouteById(routeId, userEmail);

        return ResponseEntity.status(HttpStatus.OK).body(route);
    }


    // 루트 생성
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "루트 생성", description = "루트를 생성하는 API")
    public ResponseEntity<RoutePostResponseDTO> createRoute(
            @RequestPart(value = "routeData") RoutePostRequestDTO routeData,
            @RequestPart(value = "file") MultipartFile file, Authentication authentication) {

        log.info("RouteController.createRoute() 호출됨");
        log.info("routeData: {}", routeData);
        log.info("file: {}", file);

        RoutePostResponseDTO response = routeCreateService.createRoute(routeData, file, authentication);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    
	// 루트 좋아요 등록
    @PostMapping("/{routeId}/like")
    @Operation(summary = "루트 좋아요 등록", description = "루트 좋아요 생성 API")
    public ResponseEntity<RouteLikePostResponseDTO> createRouteLike(
    		@PathVariable(name = "routeId") Long routeId,
    		Authentication authentication
    		){

		// service -> 좋아요 저장
		routeService.postRouteLike(authentication, routeId);
		
    	return ResponseEntity.status(HttpStatus.CREATED).body(null);
    }

    
    //루트 좋아요 취소 기능
    @DeleteMapping("/{routeId}/like")
    @Operation(summary = "루트 좋아요 취소", description = "루트 좋아요 삭제 API")
    public ResponseEntity<RouteLikePostResponseDTO> DeleteRouteLike(
    		@PathVariable(name = "routeId") Long routeId,
    		Authentication authentication
    		) {
    	
    	// service -> 삭제 기능
    	routeService.deleteRouteLike(authentication, routeId);
    	
    	return ResponseEntity.status(HttpStatus.NO_CONTENT).body(null);
    }

    @DeleteMapping("/{routeId}")
    @Operation(summary = "루트 삭제", description = "루트를 업로드한 유저가 루트를 삭제하는 API")
    public ResponseEntity<Void> deleteRoute(
        @PathVariable("routeId") Long routeId
        , @AuthenticationPrincipal String userEmail) {

        routeService.deleteRoute(routeId, userEmail);

        return ResponseEntity.status(HttpStatus.NO_CONTENT).body(null);

    }


    // 루트 리스트 조회
    @GetMapping("/")
    @Operation(summary = "루트 리스트 조회", description = "루트를 페이징, 필터 처리하여 리스트로 불러오는 API")
    public ResponseEntity<RouteListResponseDTO> getRouteList(
                                                    //필터정보 null 가능
                                                    @RequestParam(name = "page", defaultValue = "0") int page,
                                                    @RequestParam(name = "size", defaultValue = "8") int size,
                                                    @RequestParam(name = "sort", defaultValue = "") String sort,
                                                    @RequestParam(name = "region", defaultValue = "") String region,
                                                    @RequestParam(name = "distanceType", defaultValue = "") String distanceType,
                                                    @RequestParam(name = "altitudeType", defaultValue = "") String altitudeType,
                                                    @RequestParam(name = "roadType", defaultValue = "") String roadType,
                                                    @RequestParam(name="tag",defaultValue = "") String[] Tag,
                                                    @AuthenticationPrincipal String userEmail) {



        // 루트 데이터들을 페이징된 형태로 불러옴
        RouteListResponseDTO routeListResponseDTO = routeService.getRouteList(page, size, sort, region, distanceType,
                altitudeType, roadType, Tag, userEmail);

        log.info("보내기 직전 : {}", routeListResponseDTO);

        return ResponseEntity.status(HttpStatus.OK).body(routeListResponseDTO);
    }
    
    
}


