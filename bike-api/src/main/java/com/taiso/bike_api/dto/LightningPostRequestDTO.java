package com.taiso.bike_api.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;

import com.taiso.bike_api.domain.LightningEntity.BikeType;
import com.taiso.bike_api.domain.LightningEntity.Gender;
import com.taiso.bike_api.domain.LightningEntity.Level;
import com.taiso.bike_api.domain.LightningEntity.LightningStatus;
import com.taiso.bike_api.domain.LightningEntity.RecruitType;
import com.taiso.bike_api.domain.LightningEntity.Region;

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
public class LightningPostRequestDTO {

    private String title;

    private String description;

    private LocalDateTime eventDate;

    private Integer duration;

    private LightningStatus status;

    private Integer capacity;

    private BigDecimal latitude;

    private BigDecimal longitude;

    private Gender gender;

    private Level level;

    private RecruitType recruitType;

    private BikeType bikeType;

    private Region region;

    private Long distance;

    private Long routeId;

    private String address;

    private Boolean isClubOnly;

    private Long clubId;

    private Set<String> tags;

}
