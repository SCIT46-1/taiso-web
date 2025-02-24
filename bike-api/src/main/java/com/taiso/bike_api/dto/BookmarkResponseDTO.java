package com.taiso.bike_api.dto;

import java.time.LocalDateTime;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookmarkResponseDTO {
    private Long bookmarkId;
    private Long userId;         // 북마크를 등록한 사용자
    private Long targetUserId;   // 북마크 대상 사용자
    private LocalDateTime createdAt;
}
