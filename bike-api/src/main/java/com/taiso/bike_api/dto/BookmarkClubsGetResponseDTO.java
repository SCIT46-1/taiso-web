package com.taiso.bike_api.dto;

import java.util.List;

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
public class BookmarkClubsGetResponseDTO {

    private List<BookmarkClubResponseDTO> content;

    // 현재 페이지 넘버
    private int pageNo;
    // 한 페이지의 컨텐츠 수
    private int pageSize;
    // 총 컨텐츠 수
    private long totalElements;
    // 총 페이지 수
    private int totalPages;
    // 마지막 페이지 여부
    private boolean last;

    // public static BookmarkClubsGetResponseDTO toDTO(ClubEntity club) {
    //     return BookmarkClubsGetResponseDTO.builder()
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
