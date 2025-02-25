package com.taiso.bike_api.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.taiso.bike_api.dto.UserDetailRequestDTO;
import com.taiso.bike_api.dto.UserDetailResponseDTO;
import com.taiso.bike_api.service.UserDetailService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;

@RestController
@Slf4j
@RequestMapping("/api/users")
@Tag(name = "회원 컨트롤러", description = "회원 정보 관련 API")
public class UserController {

    @Autowired
    private UserDetailService userDetailService;

    @PostMapping("/me/page")
    @Operation(summary = "내 페이지 정보 수정", description = "상세 프로필 페이지 정보 수정")
    public ResponseEntity<UserDetailResponseDTO> updateUserDetail(@RequestPart(value = "userDetailData") UserDetailRequestDTO userDetailRequestDTO
                                                                , @RequestPart(value = "profileImg", required = false) MultipartFile profileImg
                                                                , @RequestPart(value = "backgroundImg", required = false) MultipartFile backgroundImg
                                                                , HttpServletResponse httpServletResponse){

        log.info("로직 시작 : {}", userDetailRequestDTO.toString());
        log.info("profileImg : {}",profileImg.getOriginalFilename());
        log.info("backgroundImg : {}",backgroundImg.getOriginalFilename());

        // 파일Id를 포함한 DTO를 DB로 보내 저장
        userDetailService.updateUserDetail(userDetailRequestDTO, profileImg, backgroundImg);

        //return ResponseEntity.status(201).build();
        return ResponseEntity.status(HttpStatus.CREATED).body(null);
    }

    @GetMapping("/{userId}")
    @Operation(summary = "내 페이지 정보 조회", description = "회원 프로필 페이지 정보 조회")
    public ResponseEntity<UserDetailResponseDTO> getUserDetail(@PathVariable Long userId) {

        log.info(userId.toString());
        // 찾아온 데이터를 담기
        UserDetailResponseDTO userDetailResponseDTO = userDetailService.getUserDetailById(userId);
        log.info(userDetailResponseDTO.toString());

        return ResponseEntity.status(HttpStatus.CREATED).body(userDetailResponseDTO);
    }
}
