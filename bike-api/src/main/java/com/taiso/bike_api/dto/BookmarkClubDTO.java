package com.taiso.bike_api.dto;

import java.time.LocalDateTime;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookmarkClubDTO {
    private Long bookmarkId;
    private LocalDateTime bookmarkDate;  // 북마크 등록 일시 (createdAt)
    private Long clubId;
    private String clubName;
    private String clubShortDescription;
    private Integer maxUser;
}
