package com.taiso.bike_api.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TestResponseDTO {
    private String message;
    private String timestamp;
    private String status;
}
