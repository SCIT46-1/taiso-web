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
public class ClubDetailGetResponseLeaderDTO {
    private Long leaderId;
    private String leaderName;

    public static ClubDetailGetResponseLeaderDTO toDTO(UserEntity user) {
        return ClubDetailGetResponseLeaderDTO.builder()
                                            .leaderId(user.getUserId())
                                            .leaderName(user.getUserDetail().getUserNickname())
                                            .build();
    }
}
