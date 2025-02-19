package com.taiso.bike_api.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClubInfoUpdateRequestDTO {
    @NotBlank(message = "소개글이 비어있습니다.")
    private String clubDescription;
}
