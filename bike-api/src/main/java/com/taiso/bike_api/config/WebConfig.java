package com.taiso.bike_api.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

// 웹 설정
@Configuration
public class WebConfig implements WebMvcConfigurer {
    // CORS 설정은 SecurityConfig로 일원화하여 충돌 방지
    // WebConfig에서 CORS 관련 설정 제거
}
