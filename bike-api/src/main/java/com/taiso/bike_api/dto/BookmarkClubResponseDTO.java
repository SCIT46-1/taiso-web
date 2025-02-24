package com.taiso.bike_api.dto;

import java.time.LocalDateTime;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookmarkClubResponseDTO {
    private Long bookmarkId;
    private Long userId;      // 북마크를 등록한 사용자 ID
    private Long clubId;      // 북마크 대상 클럽 ID
    private LocalDateTime createdAt; // 북마크 등록 시각
}
