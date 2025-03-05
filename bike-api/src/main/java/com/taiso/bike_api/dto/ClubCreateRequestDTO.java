package com.taiso.bike_api.dto;

import lombok.*;

import java.util.Set;

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
