package com.taiso.bike_api.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import com.taiso.bike_api.domain.RouteTagCategoryEntity;
import com.taiso.bike_api.domain.RouteEntity.AltitudeType;
import com.taiso.bike_api.domain.RouteEntity.DistanceType;
import com.taiso.bike_api.domain.RouteEntity.Region;
import com.taiso.bike_api.domain.RouteEntity.RoadType;

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
public class BookmarkRouteListResponseDTO {

	// BookmarkEntity
    private Long bookmarkId;
    
	private Long userId;
	
	private Long bookmarkedRouteId;
	
	private Integer totalBookmark;
	
    private LocalDateTime createdAt;

    // routeEntity
    private Long routeId;

    private String routeImgId;
    
    private String routeName;

    private Long likeCount;
    private Set<RouteTagCategoryEntity> tags = new HashSet<>();
    private BigDecimal distance;
    private BigDecimal altitude;
    private Region region;
    private DistanceType distanceType;
    private AltitudeType altitudeType;
    private RoadType roadType;
    private LocalDateTime bookmarkcreatedAt;         // ISO8601 또는 다른 DateTime 형식을 사용, required
    
    
}
