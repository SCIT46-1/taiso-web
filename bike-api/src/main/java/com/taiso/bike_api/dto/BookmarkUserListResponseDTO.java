package com.taiso.bike_api.dto;

import java.time.LocalDateTime;

import com.taiso.bike_api.domain.UserDetailEntity.Gender;
import com.taiso.bike_api.domain.UserDetailEntity.Level;

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
public class BookmarkUserListResponseDTO {

	// BookmarkEntity
    private Long bookmarkId;
    
	private Long userId;
	
	private Long bookmarkedUserId;
	
	private Integer totalBookmark;
	
    private LocalDateTime createdAt;

    // userDetail
 	private String userNickname;
 	
 	private String userProfileImg;
 	
    private Gender gender;
    
    private Level level;
    
    
	
	
	
	
	
	
	
}
