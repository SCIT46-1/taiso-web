package com.taiso.bike_api.dto;

import java.time.LocalDateTime;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookmarkLightningResponseDTO {
    private Long bookmarkId;
    private Long userId;         // 북마크를 등록한 사용자 ID
    private Long lightningId;    // 북마크 대상 번개 ID
    private LocalDateTime createdAt;
}
