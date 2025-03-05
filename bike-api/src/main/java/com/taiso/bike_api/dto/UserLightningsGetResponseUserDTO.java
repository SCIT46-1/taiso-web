package com.taiso.bike_api.dto;

import java.util.Set;

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
public class UserLightningsGetResponseUserDTO {
    private Long userId;
    private String userNickname;
    private String userProfileImg;
    private String bio;
}
