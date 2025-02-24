package com.taiso.bike_api.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookmarkLightningDTO {
    private Long bookmarkId;
    private LocalDateTime bookmarkDate; // 북마크 등록 일시
    private Long lightningId;
    private String title;
    private LocalDateTime eventDate;
    private Integer duration;
    private String status;       // 예: 모집, 마감, 종료, 취소
    private BigDecimal latitude;
    private BigDecimal longitude;
    private Integer capacity;
    private String gender;
    private String level;
}
