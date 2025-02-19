package com.taiso.bike_api.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@Builder
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class UserDetailResponseDTO {

    private Long userId;
    private String userNickname;
    private String vio;
    private String profileImg;
    private String backgroundImg;
    private String level;
    private String fullName;
    private String gender;
    private Integer age;
    private Integer height;
    private Integer weight;
    private Integer FTP;
    private String phoneNumber;
    private LocalDateTime birthDate;
}
