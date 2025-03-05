package com.taiso.bike_api.domain;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "club")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClubEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "club_id")
    private Long clubId;

    /**
     * 클럽 이미지 id (null이면 기본 이미지)
     */
    @Column(name = "club_profile_image_id")
    private String clubProfileImageId;

    /**
     * 클럽명 (고유)
     */
    @Column(name = "club_name", nullable = false, unique = true)
    private String clubName;

    /**
     * 클럽장 (users 테이블의 user_id를 참조)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "club_leader_id", nullable = false)
    private UserEntity clubLeader;

    /**
     * 클럽 관련 짧은 설명
     */
    @Column(name = "club_short_description", nullable = false)
    private String clubShortDescription;

    /**
     * 클럽 관련 긴 설명 (필요시 TEXT 컬럼으로 지정)
     */
    @Column(name = "club_description", columnDefinition = "TEXT")
    private String clubDescription;

    /**
     * 생성 시각 (자동 설정)
     */
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * 수정 시각 (자동 업데이트)
     */
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    /**
     * 클럽 최대 인원
     */
    @Column(name = "max_user")
    private Integer maxUser;

    // many-to-many: cascade persist/merge 적용(단, 삭제 시 태그 자체는 삭제하지 않음)
    @ManyToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(name = "club_tag",
            joinColumns = @JoinColumn(name = "club_id"),
            inverseJoinColumns = @JoinColumn(name = "tag_id"))
    @Builder.Default
    private Set<LightningTagCategoryEntity> tags = new HashSet<>();

    @OneToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE}, mappedBy = "club")
    @Builder.Default
    private List<ClubMemberEntity> users = new ArrayList<>();

    @OneToMany(mappedBy = "club", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ClubBoardEntity> posts = new ArrayList<>();
}