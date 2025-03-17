package com.taiso.bike_api.dto;

import java.time.LocalDate;

import com.taiso.bike_api.domain.UserDetailEntity.Gender;
import com.taiso.bike_api.domain.UserDetailEntity.Level;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
@ToString
public class UserDetailPatchRequestDTO {
    private String nickname;
    private String fullName;
    private String userProfileImg;
    private String userBackgroundImg;
    private String phoneNumber;
    private LocalDate birthDate;
    private String bio;
    private Gender gender;
    private Level level;
    private Integer height;
    private Integer weight;
    private Integer FTP;
}
