package com.taiso.bike_api.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@Builder
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class LightningDetailGetResponseDTO {

    private Long lightningId;

    private String title;
    private String description;

    private LocalDateTime eventDate;
    private Integer duration;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private String status;
    private Integer capacity;

    private Integer currentMemberCount;

    private BigDecimal latitude;
    private BigDecimal longitude;

    private String gender;
    private String level;
    private String bikeType;
    private String region;

    private String recruitType;

    private Long distance;
    private String address;

    private Long creatorId;
    // 번개 생성자 정보
    private LightningDetailCreatorDTO creator;

    // 루트 관련 정보
    private LightningDetailRouteDTO route;

    // 클럽 관련
    private Boolean isClubOnly;
    private LightningDetailClubDTO club;

    // 번개 참여자
    private List<LightningDetailMemberDTO> member;

    // 번개 태그
    private Set<String> lightningTag;

    // 북마크 여부
    private Boolean bookmarked;
}
