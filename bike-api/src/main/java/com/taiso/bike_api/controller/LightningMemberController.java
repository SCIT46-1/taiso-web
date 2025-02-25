package com.taiso.bike_api.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.taiso.bike_api.dto.JoinParticipantsPostResponseDTO;
import com.taiso.bike_api.service.LightningMemberService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;

@RestController
@Slf4j
@RequestMapping("/api/lightnings")
@Tag(name = "번개 멤버 컨트롤러", description = "번개 멤버 관련 API")
public class LightningMemberController {

    @Autowired
    private LightningMemberService lightningMemberService;

	@PostMapping("{lightningId}/participants")
  @Operation(summary = "번개 참가 및 참가 신청", description = "번개에 현재 사용자 참가 및 참가 신청 API")
	public ResponseEntity<JoinParticipantsPostResponseDTO> joinLightning(
    		@PathVariable(name = "lightningId") Long lightningId,
			Authentication authentication
			) {
		
		lightningMemberService.JoinParticipants(lightningId, authentication);
		
		return ResponseEntity.status(HttpStatus.CREATED).body(null);
	}
	
	// 인원 다 찼을 때 마감 Service.autoClose 도착했을 때의 TEST
//  @Operation(summary = "번개 마감", description = "인원 가득 찼을 때 마감 수정 테스트") 
//	@PatchMapping("{lightningId}/auto-close")
//	public void autoClose(
//    		@PathVariable(name = "lightningId") Long lightningId
//			){
//		lightningMemberService.autoClose(lightningId);
//	}
	
    
    // 번개 강제 마감
    @Operation(summary = "번개 강제 마감", description = "번개 강제 마감 API")
    @PatchMapping("{lightningId}/close")  
    public ResponseEntity<JoinParticipantsPostResponseDTO> lightningClose(
    		@PathVariable(name = "lightningId") Long lightningId,
			Authentication authentication
    		) {
    	
    	lightningMemberService.lightningClose(lightningId, authentication);

		return ResponseEntity.status(HttpStatus.CREATED).body(null);
    }

	@Operation(summary = "번개 나가기", description = "스스로 번개를 나가는 API")
	@PatchMapping("/{lightningId}/exit")
	public ResponseEntity<JoinParticipantsPostResponseDTO> exitMemberLightning (
			@PathVariable(name = "lightningId") Long lightningId,
			Authentication authentication) {

		lightningMemberService.exitLightning(lightningId,authentication);

		return ResponseEntity.status(HttpStatus.CREATED).body(null);
	}

	@Operation(summary = "번개 참가 신청 취소", description = "신청했던 번개 참가를 수락되기 전에 취소하는 API")
	@PatchMapping("{lightningId}/participants")
	public ResponseEntity<JoinParticipantsPostResponseDTO> cancelJoinLightning(
			@PathVariable(name = "lightningId") Long lightningId,
			Authentication authentication) {

		lightningMemberService.cancelJoinLightning(lightningId,authentication);

		return ResponseEntity.status(HttpStatus.CREATED).body(null);
	}
    
    // 번개 참가 수락
    @Operation(summary = "번개 참가 수락", description = "번개 참가 수락 API")
    @PatchMapping("{lightningId}/join-requests/{userId}")
    public ResponseEntity<JoinParticipantsPostResponseDTO> lightningJoinRequests(
    		@PathVariable(name = "lightningId") Long lightningId,
    		@PathVariable(name = "userId") Long userId,
			Authentication authentication
    		) {
    	// 번개 아이디, 참가 신청 아이디, 관리자 아이디
    	lightningMemberService.JoinRequests(lightningId, userId, authentication);

		return ResponseEntity.status(HttpStatus.CREATED).body(null);
    }
    
    // 번개 참가 거절 (탈퇴 처리)
    @Operation(summary = "번개 참가 거절", description = "번개 참가 거절 API")
    @PatchMapping("{lightningId}/join-rejection/{userId}")
    public ResponseEntity<JoinParticipantsPostResponseDTO> LightningJoinRejection(
    		@PathVariable(name = "lightningId") Long lightningId,
    		@PathVariable(name = "userId") Long userId,
			Authentication authentication
    		) {
    	// 번개 아이디, 참가 신청 아이디, 관리자 아이디
    	lightningMemberService.JoinRejection(lightningId, userId, authentication);
    	
    	// 탈퇴 처리로 변경 완료
		return ResponseEntity.status(HttpStatus.CREATED).body(null);
    }
    
    

    
}
