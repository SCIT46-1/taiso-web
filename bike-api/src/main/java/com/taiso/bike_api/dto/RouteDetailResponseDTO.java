package com.taiso.bike_api.dto;

import java.util.List;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class RouteDetailResponseDTO {
    private Long routeId;
    private String routeImgId;
    private Long userId;
    private String routeName;
    private String description;
    private Long likeCount;
    private String originalFilePath;
    private List<String> tag;         // not required field
    private Float distance;           // not required field (unit: km)
    private Float altitude;           // not required field (unit: m)
    private String distanceType;      // e.g., 단거리, 장거리, optional
    private String altitudeType;      // e.g., 클라이밍, 평지, optional
    private String roadType;          // e.g., 자전거 도로, 국도, optional
    private String createdAt;         // ISO8601 또는 다른 DateTime 형식을 사용, required
    private String fileName;          // optional
    private String fileType;          // optional (e.g., gpx, fit)
    private List<RoutePointDTO> routePoint;
    private boolean isLiked;
}
