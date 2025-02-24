package com.taiso.bike_api.dto;

import java.util.List;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookmarkUserListResponseDTO {
    private Long userId; // 현재 로그인한 사용자의 ID
    private List<BookmarkUserResponseDTO> bookmarkedUsers;
}
