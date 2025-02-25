package com.taiso.bike_api.domain;


import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "route")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RouteEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "route_id")
    private Long routeId;

    @Column(name = "route_name", nullable = false, length = 255)
    private String routeName;

    @Column(name = "description", length = 1000, nullable = false)
    private String description;

    @Column(name = "route_img_id", length = 1000)
    private String routeImgId;

    // route의 소유자(작성자)의 user_id(외래키)는 단순 값으로 관리하거나 별도의 연관관계를 설정할 수 있습니다.
    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "like_count", columnDefinition = "BIGINT default 0", nullable = false)
    private Long likeCount;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "region", nullable = false, length = 20)
    private Region region;

    @Column(name = "distance", nullable = false, precision = 10, scale = 2)
    private BigDecimal distance;

    @Column(name = "altitude", nullable = false, precision = 10, scale = 2)
    private BigDecimal altitude;

    @Enumerated(EnumType.STRING)
    @Column(name = "distance_type", nullable = false, length = 20)
    private DistanceType distanceType;

    @Enumerated(EnumType.STRING)
    @Column(name = "altitude_type", nullable = false, length = 20)
    private AltitudeType altitudeType;

    @Enumerated(EnumType.STRING)
    @Column(name = "road_type", nullable = false, length = 20)
    private RoadType roadType;

    @Column(name = "original_file_path", length = 1000)
    private String originalFilePath;

    @Column(name = "file_name", length = 255, nullable = false)
    private String fileName;

    @Enumerated(EnumType.STRING)
    @Column(name = "file_type", length = 10, nullable = false)
    private FileType fileType;

    @ManyToMany(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(name = "route_tag",
            joinColumns = @JoinColumn(name = "route_id"),
            inverseJoinColumns = @JoinColumn(name = "tag_id"))
    @Builder.Default
    private Set<RouteTagCategoryEntity> tags = new HashSet<>();

    @OneToMany(mappedBy = "route", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RoutePointEntity> routePoints;

    public enum Region {
        서울,
        경기,
        인천,
        강원,
        충청,
        전라,
        경상,
        제주
    }

    public enum DistanceType {
        단거리,
        중거리,
        장거리
    }

    public enum AltitudeType {
        평지,
        힐리,
        클라이밍,
        마운틴
    }

    public enum RoadType {
        자전거도로,
        공도,
        산길
    }

    public enum FileType {
        GPX,
        TCX
    }

}