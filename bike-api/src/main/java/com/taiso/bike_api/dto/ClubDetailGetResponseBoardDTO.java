// package com.taiso.bike_api.dto;

// import java.time.LocalDateTime;

// import com.taiso.bike_api.domain.ClubBoardEntity;

// import lombok.AllArgsConstructor;
// import lombok.Builder;
// import lombok.Getter;
// import lombok.NoArgsConstructor;
// import lombok.Setter;
// import lombok.ToString;

// @NoArgsConstructor
// @AllArgsConstructor
// @Setter
// @Getter
// @ToString
// @Builder
// public class ClubDetailGetResponseBoardDTO {
//     private Long postId;
//     private String postTitle;
//     private String postContent;
//     private LocalDateTime createdAt;
//     private ClubDetailGetResponseBoardWriterDTO postWriter;

//     public static ClubDetailGetResponseBoardDTO toDTO(ClubBoardEntity entity) {
//         return ClubDetailGetResponseBoardDTO.builder()
//                                            .postId(entity.getPostId())
//                                            .postTitle(entity.getPostTitle())
//                                            .postContent(entity.getPostContent())
//                                            .createdAt(entity.getCreatedAt())
//                                            .postWriter(ClubDetailGetResponseBoardWriterDTO.toDTO(entity.getPostWriter()))
//                                            .build();
//     }
// }
