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
public class ClubDescriptionUpdateResponseDTO {

    private String message;

    public static ClubDescriptionUpdateResponseDTO toDTO(String message) {
        return ClubDescriptionUpdateResponseDTO.builder()
                                               .message("클럽 소개글이 수정되었습니다.")
                                               .build();
    }
}
