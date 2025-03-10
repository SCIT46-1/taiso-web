package com.taiso.bike_api.dto;

import java.util.Set;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
@ToString
@Builder
public class ClubsGetResponseDTO {
    private Long clubId;
    private String clubProfileImageId;
    private String clubName;
    private Long clubLeaderId;
    private String clubLeaderName;
    private String clubLeaderProfileImageId;
    private String clubShortDescription;
    private Integer maxScale;
    private Integer currentScale;
    private Set<String> tags;

    @Builder.Default
    private boolean isBookmarked = false;

}
