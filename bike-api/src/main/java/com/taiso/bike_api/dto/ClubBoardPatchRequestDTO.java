package com.taiso.bike_api.dto;

import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
@ToString
public class ClubBoardPatchRequestDTO {

    private String postTitle;
    private String postContent;
    private Boolean isNotice;

}
