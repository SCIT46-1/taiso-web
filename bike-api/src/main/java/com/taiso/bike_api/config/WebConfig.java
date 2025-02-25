package com.taiso.bike_api.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

// 웹 설정
@Configuration
public class WebConfig implements WebMvcConfigurer {
    // CORS 설정
    @Override
    public void addCorsMappings(@NonNull CorsRegistry registry) {
        // 모든 경로에 대해 CORS 설정
        registry.addMapping("/**")
                // 허용할 오리진 설정
                .allowedOrigins("http://localhost:3000") // TODO: 프로덕션 도메인 추가
                // 허용할 HTTP 메서드 설정
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                // 인증 정보 허용 여부 설정
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
