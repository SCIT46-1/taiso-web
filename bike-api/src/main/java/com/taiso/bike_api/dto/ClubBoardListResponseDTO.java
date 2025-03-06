package com.taiso.bike_api.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString

@Builder
public class ClubBoardListResponseDTO {

    // 데이터가 담긴 리스트
    private List<ResponseClubBoardListDTO> content;

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
}
