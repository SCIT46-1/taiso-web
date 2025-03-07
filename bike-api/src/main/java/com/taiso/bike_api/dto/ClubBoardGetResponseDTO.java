package com.taiso.bike_api.dto;


import java.time.LocalDateTime;

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
public class ClubBoardGetResponseDTO {

    private Long postId;
    private Long postWriter;
    private String writerNickname;
    private String writerProfileImg;

    private String postTitle;
    private String postContent;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Boolean isNotice;
    // 현재 유저가 관리자 권한이 있는가
    private Boolean canDelete;
    private Boolean canEdit;

}
