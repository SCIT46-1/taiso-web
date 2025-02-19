package com.taiso.bike_api.dto;

import java.time.LocalDateTime;
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
public class ClubDetailResponseDTO {
    private Long clubId;
    private Long clubProfileImageId;
    private String clubName;
    // 클럽장은 UserEntity로 관리되지만, 여기서는 식별자인 userId로 응답합니다.
    private Long clubLeaderId;
    private String clubDescription;
    private LocalDateTime createdAt;
    private Integer maxUser;
    // currentScale: 현재 가입된 회원 수
    private int currentScale;
    // 클럽에 가입한 회원 목록 (회원의 id와 닉네임 포함)
    private List<ClubMemberDTO> users;
}
