package com.taiso.bike_api.dto;

import com.taiso.bike_api.domain.UserEntity;
import lombok.*;

import java.time.LocalDateTime;

@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
@ToString
@Builder
public class ResponseClubBoardListDTO {

    private Long postId;
    private Long postWriter;
    private String writerNickname;
    private String writerProfileImg;
    private String postTitle;
    // 미리보기용
    private String postContent;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Boolean isNotice;
    // 현재 유저가 관리자 권한이 있는가
    private Boolean canDelete;
    private Boolean canEdit;

}
