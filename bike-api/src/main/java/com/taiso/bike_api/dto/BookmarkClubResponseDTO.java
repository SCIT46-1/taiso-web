package com.taiso.bike_api.dto;

import java.util.Set;

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
public class BookmarkClubResponseDTO {
    private Long clubId;
    private String clubProfileImageId;
    private String clubName;
    private Long clubLeaderId;
    private String clubLeaderName;
    private String clubLeaderProfileImageId;
    private String clubShortDescription;
    private Integer maxScale;
    private Integer currentScale;
    private Set<String> tags;
    private boolean isBookmarked;

    // public static BookmarkClubResponseDTO toDTO(ClubEntity club) {
    //     return BookmarkClubResponseDTO.builder()
    //         .clubId(club.getClubId())
    //         .clubProfileImageId(club.getClubProfileImageId())
    //         .clubName(club.getClubName())
    //         .clubLeaderId(club.getClubLeader().getUserId())
    //         .clubLeaderName(club.getClubLeader().getUserDetail().getUserNickname())
    //         .clubLeaderProfileImageId(club.getClubLeader().getUserDetail().getUserProfileImg())
    //         .clubShortDescription(club.getClubShortDescription())
    //         .maxScale(club.getMaxUser())
    //         .currentScale(club.getUsers().size())
    //         .tags(club.getTags().stream().map(tag -> tag.getName()).collect(Collectors.toSet()))
    //         .build();
    // }
}
