package com.taiso.bike_api.dto;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import com.taiso.bike_api.domain.ClubEntity;
import com.taiso.bike_api.domain.ClubMemberEntity.ParticipantStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;


@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
@ToString
@Builder
public class ClubDetailGetResponseDTO {
    private Long clubId;
    private String clubProfileImageId;
    private String clubName;
    private ClubDetailGetResponseLeaderDTO clubLeader;
    private String clubDescription;
    private String clubShortDescription;
    private LocalDateTime createdAt;
    private Integer maxUser;
    private Integer currentScale;
    @Builder.Default
    private List<ClubDetailGetResponseUserDTO> users = new ArrayList<>();
    @Builder.Default
    private Set<String> tags = new HashSet<>();

    public static ClubDetailGetResponseDTO toDTO(ClubEntity entity) {
        return ClubDetailGetResponseDTO.builder()
                                       .clubId(entity.getClubId())
                                       .clubProfileImageId(entity.getClubProfileImageId())
                                       .clubName(entity.getClubName())
                                       .clubShortDescription(entity.getClubShortDescription())
                                       .clubLeader(ClubDetailGetResponseLeaderDTO.toDTO(entity.getClubLeader()))
                                       .clubDescription(entity.getClubDescription())
                                       .createdAt(entity.getCreatedAt())
                                       .maxUser(entity.getMaxUser())
                                       .currentScale(entity.getUsers().stream().filter(member -> member.getParticipantStatus() == ParticipantStatus.완료 || member.getParticipantStatus() == ParticipantStatus.승인).collect(Collectors.toList()).size())
                                       .users(entity.getUsers().stream()
                                              .map(member -> ClubDetailGetResponseUserDTO.toDTO(
                                                  member.getUser(), 
                                                  member.getParticipantStatus().toString()))
                                              .collect(Collectors.toList()))
                                       .tags(entity.getTags().stream()
                                             .map(tag -> tag.getName())
                                             .collect(Collectors.toSet()))
                                       .build();
    }
}
