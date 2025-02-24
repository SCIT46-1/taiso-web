package com.taiso.bike_api.dto;

import java.util.List;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookmarkClubListResponseDTO {
    private Long userId;  // 현재 사용자의 ID
    private List<BookmarkClubDTO> bookmarkClub;
}
