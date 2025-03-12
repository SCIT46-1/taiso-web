package com.taiso.bike_api.dto;

import java.util.Set;

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
public class UserDetailResponseDTO {

    private Long userId;
    private String userNickname;
    private String bio;
    private String profileImg;
    private String backgroundImg;
    private String level;
    private String gender;
    private Set<String> tags;

    private Integer userLightningsCount;

    private Integer userClubsCount;

    private Integer userRegisteredRoutesCount;

    private boolean bookmarked;
}
