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
public class ClubCreateRequestDTO {
    // 클럽 이미지 ID (null이면 기본 이미지)
    //TODO : 이미지 관련 확인 필요
    private Long clubProfileImage;
    
    // 클럽명 (고유)
    private String clubName;
    
    // 클럽의 간단한 설명
    private String clubShortDescription;
    
    // 클럽에 적용할 태그들의 ID 목록
    private List<Long> tags;
    
    // 클럽 최대 인원
    private Integer maxUser;
}
