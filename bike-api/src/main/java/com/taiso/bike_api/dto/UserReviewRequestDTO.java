package com.taiso.bike_api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserReviewRequestDTO {
    @NotBlank(message = "리뷰 내용은 필수입니다.")
    private String reviewContent;

    @NotNull(message = "리뷰 태그는 필수입니다.")
    private String reviewTag; // EXCELLENT, GOOD, AVERAGE, POOR 등의 값 (대소문자 무관)
}
