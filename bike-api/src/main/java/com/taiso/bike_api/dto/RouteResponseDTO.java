package com.taiso.bike_api.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString

@Builder
public class RouteResponseDTO {

    private Long routeId;
    private String routeImgId;
    private Long userId;
    private String routeName;
    private Long likeCount;
    private List<String> tag;         // not required field
    private Float distance;           // not required field (unit: km)
    private Float altitude;           // not required field (unit: m)
    private String distanceType;      // e.g., 단거리, 장거리, optional
    private String altitudeType;      // e.g., 클라이밍, 평지, optional
    private String roadType;          // e.g., 자전거 도로, 국도, optional
    private String createdAt;         // ISO8601 또는 다른 DateTime 형식을 사용, required
//    private String fileType;

}
