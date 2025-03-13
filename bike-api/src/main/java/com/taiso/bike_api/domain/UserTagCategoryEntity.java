package com.taiso.bike_api.domain;

import java.util.HashSet;
import java.util.Set;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "user_tag_category")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserTagCategoryEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "tag_id")
    private Long tagId;

    @Column(name = "category", nullable = false, length = 20)
    private String category;

    @Column(name = "name", nullable = false, unique = true, length = 255)
    private String name;

    // @CreationTimestamp
    // @Column(name = "created_at", nullable = false, updatable = false)
    // private LocalDateTime createdAt;

    // @UpdateTimestamp
    // @Column(name = "updated_at", nullable = false)
    // private LocalDateTime updatedAt;

    @ManyToMany(mappedBy = "tags")
    @Builder.Default
    private Set<UserDetailEntity> users = new HashSet<>();

    public enum ActivityTime {
        오전, 오후, 저녁
    }

    public enum ActivityDay {
        월, 화, 수, 목, 금, 토, 일
    }

    public enum ActivityLocation {
        서울, 경기, 인천, 부산, 대구, 광주, 대전, 울산, 경상북도, 경상남도,
        전라남도, 전라북도, 충청남도, 충청북도, 강원도, 제주도,
    }


     public enum BikeType {
        로드, 그래블, 하이브리드, MTB, 픽시, 트라이애슬론, 투어링, 따릉이, 자유
    }
}
