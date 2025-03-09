package com.taiso.bike_api.dto;

import com.taiso.bike_api.domain.UserEntity;

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
public class ClubDetailGetResponseUserDTO {
    private Long userId;
    private String userNickname;
    private String userProfileImage;
    private String bio;
    private String participantStatus;

    public static ClubDetailGetResponseUserDTO toDTO(UserEntity user) {
        return ClubDetailGetResponseUserDTO.builder()
                                           .userId(user.getUserId())
                                           .userNickname(user.getUserDetail().getUserNickname())
                                           .userProfileImage(user.getUserDetail().getUserProfileImg())
                                           .bio(user.getUserDetail().getBio())
                                           .build();
    }
}
