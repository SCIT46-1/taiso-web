package com.taiso.bike_api.dto;

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
public class ClubDetailsUpdateResponseDTO {
    private String message;

    public static ClubDetailsUpdateResponseDTO toDTO(String message) {
        return ClubDetailsUpdateResponseDTO.builder()
                                           .message(message)
                                           .build();
    }
}
