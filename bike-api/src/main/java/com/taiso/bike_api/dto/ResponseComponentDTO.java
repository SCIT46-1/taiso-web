package com.taiso.bike_api.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.taiso.bike_api.domain.LightningEntity.BikeType;
import com.taiso.bike_api.domain.LightningEntity.Gender;
import com.taiso.bike_api.domain.LightningEntity.Level;
import com.taiso.bike_api.domain.LightningEntity.LightningStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
@ToString
@Builder
public class ResponseComponentDTO {
    private Long lightningId;
    private Long creatorId;
    private String title;
    private LocalDateTime eventDate;
    private Integer duration;
    private LocalDateTime createdAt;
    private LightningStatus status;
    private Integer capacity;
    // private Integer currentParticipants;
    private Gender gender;
    private Level level;
    private BikeType bikeType;
    private List<String> tags;
    private String address;
    private String routeImgId;
}
