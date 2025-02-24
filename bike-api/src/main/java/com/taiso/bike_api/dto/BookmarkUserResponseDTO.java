package com.taiso.bike_api.dto;

import java.time.LocalDateTime;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookmarkUserResponseDTO {
    private Long userId;
    private String userNickname;
    private String userProfileImg;
    private LocalDateTime createdAt; // 현재 사용자가 해당 회원을 북마크한 시각
    private String gender;
    private String level;
    private Long totalBookmarks; // 해당 회원이 받은 전체 북마크 수
}
