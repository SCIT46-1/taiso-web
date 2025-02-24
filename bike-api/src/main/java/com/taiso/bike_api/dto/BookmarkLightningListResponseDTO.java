package com.taiso.bike_api.dto;

import java.util.List;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookmarkLightningListResponseDTO {
    private Long userId;  // 북마크를 등록한 사용자 ID (현재 사용자)
    private List<BookmarkLightningDTO> bookmarkedLightnings;
}
