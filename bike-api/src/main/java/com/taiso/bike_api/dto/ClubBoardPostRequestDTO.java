package com.taiso.bike_api.dto;

import com.taiso.bike_api.domain.ClubEntity;
import com.taiso.bike_api.domain.UserEntity;
import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
@ToString
@Builder
public class ClubBoardPostRequestDTO {

    private String postTitle;
    private String postContent;
    private Boolean isNotice;

}
