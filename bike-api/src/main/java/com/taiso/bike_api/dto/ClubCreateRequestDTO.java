package com.taiso.bike_api.dto;

import java.util.Set;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
@ToString
public class ClubCreateRequestDTO {

    private String clubName;
    private String clubProfileImageId;
//  private UserEntity clubLeader;
    private String clubShortDescription;
    private String clubDescription;
    private Integer maxUser;
    private Set<String> tags;

}
