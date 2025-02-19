package com.taiso.bike_api.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClubUpdateRequestDTO {
    // 클럽 이미지 ID (null이면 기본 이미지)
    private Long clubProfileImage;
    
    // 클럽명 (수정할 경우 중복 체크 필요)
    private String clubName;
    
    // 클럽 간단 설명
    private String clubShortDescription;
    
    // 클럽 상세 설명
    private String clubDescription;
    
    // 적용할 태그 ID 목록
    private List<Long> tags;
    
    // 클럽 최대 인원
    private Integer maxUser;
}
