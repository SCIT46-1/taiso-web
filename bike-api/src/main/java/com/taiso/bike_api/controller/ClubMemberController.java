package com.taiso.bike_api.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.taiso.bike_api.dto.ClubJoinMemberResponseDTO;
import com.taiso.bike_api.dto.ClubLeaderResponseDTO;
import com.taiso.bike_api.dto.ClubLightningListResponseDTO;
import com.taiso.bike_api.dto.ClubMemberWithdrawalResponseDTO;
import com.taiso.bike_api.service.ClubMemberService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;

@RestController
@Slf4j
@RequestMapping("/api/clubs")
@Tag(name = "클럽 멤버 컨트롤러", description = "클럽 멤버 관련 API")
public class ClubMemberController {

    @Autowired
    private ClubMemberService clubMemberService;
	
	// 클럽 멤버 가입 신청
	@PostMapping("/{clubId}/members")
  	@Operation(summary = "클럽 가입 신청", description = "클럽에 현재 사용자 가입 신청 API")
	public ResponseEntity<ClubJoinMemberResponseDTO> clubsMembers(
    		@PathVariable(name = "clubId") Long clubId,
			Authentication authentication
			) {
		
		clubMemberService.joinClubMember(clubId, authentication);
		
		return ResponseEntity.status(HttpStatus.CREATED).body(null);
	}
	
	// 클럽 멤버 가입 수락
	@PatchMapping("/{clubId}/members/{userId}")
  	@Operation(summary = "클럽 가입 수락", description = "클럽에 현재 사용자 가입 수락 API")
	public ResponseEntity<ClubJoinMemberResponseDTO> clubsMembersAccept(
    		@PathVariable(name = "clubId") Long clubId,
    		@PathVariable(name = "userId") Long userId,
			Authentication authentication
			) {
		
		clubMemberService.clubMemberAccept(clubId, userId, authentication);

		return ResponseEntity.status(HttpStatus.OK).body(null);
	}
	
	// 클럽 멤버 가입 거절
	@DeleteMapping("/{clubId}/members/{userId}")
  	@Operation(summary = "클럽 가입 거절", description = "클럽 사용자 가입 거절 API")
	public ResponseEntity<ClubJoinMemberResponseDTO> clubsMemberReject(
    		@PathVariable(name = "clubId") Long clubId,
    		@PathVariable(name = "userId") Long userId,
			Authentication authentication
			) {
		clubMemberService.clubMemberReject(clubId, userId, authentication);

		return ResponseEntity.status(HttpStatus.OK).body(null);
	}
	
	// 현재 사용자가 클럽에서 탈퇴
	@DeleteMapping("/{clubId}/members")
  	@Operation(summary = "클럽 탈퇴", description = "클럽 사용자 탈퇴 API")
	public ResponseEntity<ClubMemberWithdrawalResponseDTO> clubMemberWithdrawal(
    		@PathVariable(name = "clubId") Long clubId,
			Authentication authentication
			) {
		
		clubMemberService.clubMemberWithdrawal(clubId, authentication);
		
		return ResponseEntity.status(HttpStatus.NO_CONTENT).body(null);
	}
	
	// 클럽 번개 리스트 조회
	@GetMapping("/{clubId}/lightnings")
  	@Operation(summary = "클럽 번개 리스트", description = "클럽 번개 리스트 조회 API")
	public ResponseEntity<List<ClubLightningListResponseDTO>> clubLightningsList(
    		@PathVariable(name = "clubId") Long clubId,
			Authentication authentication
			) {
		
		List<ClubLightningListResponseDTO> responseList = clubMemberService.clubLightningsList(clubId, authentication);
		
		return ResponseEntity.status(HttpStatus.OK).body(responseList);
	}
	
	// 클럽장 위임
	@PatchMapping("/{clubId}/leader/{userId}")
  	@Operation(summary = "클럽장 위임", description = "클럽장 위임 API")
	public ResponseEntity<ClubLeaderResponseDTO> clubLeaderController(
    		@PathVariable(name = "clubId") Long clubId,
    		@PathVariable(name = "userId") Long userId,
			Authentication authentication
			) {
		clubMemberService.clubLeader(clubId, userId, authentication);
		
		return ResponseEntity.status(HttpStatus.OK).body(null);
	}
	
	
}
