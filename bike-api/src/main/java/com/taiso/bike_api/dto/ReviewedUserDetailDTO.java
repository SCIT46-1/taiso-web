package com.taiso.bike_api.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewedUserDetailDTO {
    private Long userId;
    private String userProfileImg;
    private String userNickname;
}
