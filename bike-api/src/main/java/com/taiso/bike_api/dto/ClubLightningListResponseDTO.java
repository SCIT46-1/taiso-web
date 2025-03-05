package com.taiso.bike_api.dto;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import com.taiso.bike_api.domain.LightningEntity.BikeType;
import com.taiso.bike_api.domain.LightningEntity.Gender;
import com.taiso.bike_api.domain.LightningEntity.Level;
import com.taiso.bike_api.domain.LightningEntity.LightningStatus;
import com.taiso.bike_api.domain.LightningTagCategoryEntity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@Builder
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class ClubLightningListResponseDTO {

	private Long lightningId;
	
	private Long creatorId;
	
	private String title;
	
	private LocalDateTime eventDate;
	
	private Integer duration;
	
	private LocalDateTime createdAt;
	
	private LightningStatus status;
	
	private Integer capacity;
	
	// 현재 참가 인원 수
	private Integer currentParticipant;
	
	private Gender gender;
	
	private Level level;
	
	private BikeType bikeType;
	
	private Set<LightningTagCategoryEntity> tags = new HashSet<>();
	
	private String address;
	
	private Long clubId;
	
	private Long routeId;
	
}

