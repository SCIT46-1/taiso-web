package com.taiso.bike_api.dto;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

import com.taiso.bike_api.domain.LightningEntity.BikeType;
import com.taiso.bike_api.domain.UserDetailEntity.Gender;
import com.taiso.bike_api.domain.UserDetailEntity.Level;
import com.taiso.bike_api.domain.UserTagCategoryEntity.ActivityDay;
import com.taiso.bike_api.domain.UserTagCategoryEntity.ActivityLocation;
import com.taiso.bike_api.domain.UserTagCategoryEntity.ActivityTime;

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
public class UserDetailPostRequestDTO {
    private String userNickname;
    private Gender gender;
    private LocalDate birthDate;
    private String phoneNumber;
    private String fullName;
    private String bio;
    private Set<ActivityTime> activityTime;
    private Set<ActivityDay> activityDay;    
    private Set<ActivityLocation> activityLocation;
    private Set<BikeType> bikeType;
    private Level level;
    private Integer FTP;
    private Integer height;
    private Integer weight;
    @Builder.Default
    private Set<String> tags = new HashSet<>();
}
