package com.taiso.bike_api.dto;

import java.util.HashSet;
import java.util.Set;

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
public class ClubDetailsUpdateRequestDTO {
    private String clubProfileImageId;
    private String clubName;
    private String clubShortDescription;
    private Integer maxUser;
    private Set<String> tags = new HashSet<>();
}
