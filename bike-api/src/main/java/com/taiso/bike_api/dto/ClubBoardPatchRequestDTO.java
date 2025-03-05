package com.taiso.bike_api.dto;

import com.taiso.bike_api.domain.ClubEntity;
import com.taiso.bike_api.domain.UserEntity;
import lombok.*;

import java.util.Set;

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
