package com.taiso.bike_api.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

// 웹 설정
@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    @Value("${app.cors.allowed-origins}")
    private String[] allowedOrigins;
    
    // CORS 설정
    @Override
    public void addCorsMappings(@NonNull CorsRegistry registry) {
        // 모든 경로에 대해 CORS 설정
        registry.addMapping("/**")
                // 허용할 오리진 설정 - 환경 변수에서 가져옴
                .allowedOrigins(allowedOrigins)
                // 허용할 HTTP 메서드 설정
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                // 인증 정보 허용 여부 설정
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
