package com.taiso.bike_api.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookmarkRouteDTO {
    private Long bookmarkId;            // 생성된 북마크 ID
    private LocalDateTime bookmarkDate; // 북마크 등록 시간 (createdAt)
    private Long routeId;               // 루트 아이디
    private String routeName;           // 루트 이름
    private String description;         // 루트 디테일 설명
    private Integer likeCount;          // 루트 좋아요 수
    private List<String> tag;           // 루트 태그 (태그 이름 목록)
    private String region;              // 루트 지역
    private BigDecimal distance;        // 루트 거리
}
