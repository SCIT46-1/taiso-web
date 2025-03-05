package com.taiso.bike_api.dto;

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
