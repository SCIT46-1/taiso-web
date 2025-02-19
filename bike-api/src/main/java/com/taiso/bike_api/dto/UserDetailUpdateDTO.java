package com.taiso.bike_api.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDetailUpdateDTO {
    private String fullName;
    private String gender;       // "남자", "여자", "그외"
    private Integer age;
    private Integer height;
    private Integer weight;
    private Integer FTP;
    private String phoneNumber;
    private LocalDateTime birthDate;
}
