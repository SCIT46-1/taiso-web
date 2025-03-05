package com.taiso.bike_api.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.taiso.bike_api.dto.UserDetailGetResponseDTO;
import com.taiso.bike_api.dto.UserDetailPatchRequestDTO;
import com.taiso.bike_api.dto.UserDetailPostRequestDTO;
import com.taiso.bike_api.service.UserDetailService2;

import lombok.extern.slf4j.Slf4j;



@RestController
@RequestMapping("/api/users")
@Slf4j
public class UserDetailController {

    @Autowired
    private UserDetailService2 userDetailService2;

    @PostMapping("/me/details")
    public ResponseEntity<Void> postMethodName(
        @RequestBody UserDetailPostRequestDTO requestDTO
        , @AuthenticationPrincipal String userEmail) {
        userDetailService2.saveUserDetail(requestDTO, userEmail);
        return ResponseEntity.status(HttpStatus.CREATED).body(null);
    }

    @GetMapping("/me/details")
    public ResponseEntity<UserDetailGetResponseDTO> getUserDetail(@AuthenticationPrincipal String userEmail) {
        return ResponseEntity.status(HttpStatus.OK).body(userDetailService2.getUserDetail(userEmail));
    }
    
    @PatchMapping("/me/detail")
    public ResponseEntity<Void> patchUserDetail(@AuthenticationPrincipal String userEmail, @RequestBody UserDetailPatchRequestDTO requestDTO) {
        log.info("{}", requestDTO);
        userDetailService2.patchUserDetail(userEmail, requestDTO);
        return ResponseEntity.status(HttpStatus.OK).body(null);
    }
    
}
