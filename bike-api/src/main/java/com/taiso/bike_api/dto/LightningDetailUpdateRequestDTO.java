package com.taiso.bike_api.dto;

import java.util.Set;

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
public class LightningDetailUpdateRequestDTO {

    private Long lightningId;
    private Long creatorId;

    private String title;
    private String description;

    private String status;

    private String gender;
    private String level;
    private String recruitType;
    private String bikeType;
    private String region;

    private Long tagId;
    private Set<String> lightningTag;

}
