package com.taiso.bike_api.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClubListItemDTO {
    private Long clubId;
    private Long clubProfileImageId;
    private String clubName;
    private Long clubLeaderId;
    private String clubShortDescription;
    private int currentScale;
    private List<Long> tags; // 각 태그의 ID 배열
}
