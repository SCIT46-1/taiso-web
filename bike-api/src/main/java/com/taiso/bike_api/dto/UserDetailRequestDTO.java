package com.taiso.bike_api.dto;



import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class UserDetailRequestDTO {

    private Long userId;
    private String userNickname;
    private String bio;
    private String profileImg;
    private String backgroundImg;
    private String level;
    private String gender;




}
