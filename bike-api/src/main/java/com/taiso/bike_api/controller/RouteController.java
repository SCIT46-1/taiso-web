package com.taiso.bike_api.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.taiso.bike_api.dto.RouteDetailResponseDTO;
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

    @GetMapping("/{routeId}")
    @Operation(summary = "루트 디테일 조회", description = "루트 디테일 조회하는 API")
    public ResponseEntity<RouteDetailResponseDTO> getRoute(@PathVariable Long routeId) {
        RouteDetailResponseDTO route = routeService.getRouteById(routeId);
        return ResponseEntity.status(HttpStatus.OK).body(route);
    }

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



}


