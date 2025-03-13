package com.taiso.bike_api.domain;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;



@Entity
@Table(name = "strava_data", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "lightning_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserStravaDataEntity {

    /**
     * Strava 데이터 고유 식별자
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "strava_data_id")
    private Long stravaDataId;

    /**
     * 해당 데이터가 소속된 유저 (외래키: users.user_id)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    /**
     * 해당 데이터가 소속된 번개 (외래키: lightning.lightning_id)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lightning_id", nullable = false)
    private LightningEntity lightning;

    /**
     * 스트라바에서 제공하는 액티비티 Id (외부 고유값)
     */
    @Column(name = "activity_id", nullable = false, unique = true)
    private Long activityId;

    /**
     * 스트라바 API에서 제공한 액티비티 이름
     */
    @Column(name = "name", length = 500)
    private String name;

    /**
     * 움직인 시간 (초 단위 등 단위는 비즈니스 로직에 따라 결정)
     */
    @Column(name = "moving_time")
    private Integer movingTime;

    /**
     * 총 거리 (예: DECIMAL(10,2))
     */
    @Column(name = "distance", precision = 10, scale = 2)
    private BigDecimal distance;

    /**
     * 획득 고도 (예: DECIMAL(10,2))
     */
    @Column(name = "elevation", precision = 10, scale = 2)
    private BigDecimal elevation;

    /**
     * 소모 칼로리
     */
    @Column(name = "calories")
    private Integer calories;
}
