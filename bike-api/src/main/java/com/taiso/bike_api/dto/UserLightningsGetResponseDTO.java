package com.taiso.bike_api.dto;

import java.util.Set;

import com.taiso.bike_api.domain.LightningUserEntity.ParticipantStatus;

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
public class UserLightningsGetResponseDTO {
    private UserLightningsGetResponseLightningDTO lightning;
    private Set<UserLightningsGetResponseUserDTO> users;
    private UserLightningsGetResponseTagsDTO tags;
    private ParticipantStatus status;
    private boolean isStravaConnected;
}
