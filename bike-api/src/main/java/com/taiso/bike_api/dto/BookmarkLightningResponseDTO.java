package com.taiso.bike_api.dto;

import com.taiso.bike_api.domain.LightningEntity;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
@ToString
@Builder
public class BookmarkLightningResponseDTO {

    private Long lightningId;
    private Long creatorId;
    private String title;
    private LocalDateTime eventDate;
    private Integer duration;
    private LocalDateTime createdAt;
    private LightningEntity.LightningStatus status;
    private Integer capacity;
    private Integer currentParticipants;
    private LightningEntity.Gender gender;
    private LightningEntity.Level level;
    private LightningEntity.BikeType bikeType;
    private List<String> tags;
    private String address;
    private String routeImgId;

    // 북마크
    private LocalDateTime joinedAt;

}
