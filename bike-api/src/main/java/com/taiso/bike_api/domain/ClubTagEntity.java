package com.taiso.bike_api.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "club_tag")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClubTagEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "club_tag_id", nullable = false)
    private Long clubTagId;

    // club_id는 ClubEntity와의 다대일 관계로 매핑
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "club_id", nullable = false)
    private ClubEntity club;

    // tag_id는 태그 엔티티와의 다대일 관계로 매핑  
    // 여기서는 예시로 ClubTagCategoryEntity를 사용합니다.
    // @ManyToOne(fetch = FetchType.LAZY)
    // @JoinColumn(name = "tag_id", nullable = false, unique = true)
    // private ClubTagCategoryEntity tag;
}
