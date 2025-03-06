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
    @Builder.Default
    private String message = "클럽 소개글이 수정되었습니다.";

    public static ClubDescriptionUpdateResponseDTO toDTO() {
        return ClubDescriptionUpdateResponseDTO.builder().build();
    }
}
