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
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDetailRequestDTO {

    private Long userId;
    private String userNickname;
    private Integer age;
    private String gender;
    private String fullName;
    // 성별: "남자", "여자", "그외" (Entity의 Gender enum과 매핑)
    private String vio;
    private String profileImg;
    private String backgroundImg;
    private Integer height;
    private Integer weight;
    private String level;
    private Integer FTP;
    // FTP (Functional Threshold Power)
    private String phoneNumber;
    private LocalDateTime birthDate;
    // 생년월일 (LocalDateTime 형식, JSON에서는 ISO-8601 포맷 사용)
}
