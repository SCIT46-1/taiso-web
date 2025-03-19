package com.taiso.bike_api.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    @Value("${app.cors.allowed-origins}")
    private String[] allowedOrigins;
    
    // CORS 설정
    @Override
    public void addCorsMappings(@NonNull CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins(allowedOrigins)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
    
    // Fallback 라우팅 설정: 프론트엔드 라우터에서 처리할 경로에 대해 index.html 반환
    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        // OAuth 콜백 등 특정 경로를 index.html로 포워딩
        registry.addViewController("/oauth/callback").setViewName("forward:/index.html");
        
        // URL 경로에 확장자가 없는 모든 요청을 index.html로 포워딩하여 React 라우터가 처리하게 함
        registry.addViewController("/{spring:\\w+}")
                .setViewName("forward:/index.html");
        registry.addViewController("/**/{spring:\\w+}")
                .setViewName("forward:/index.html");
    }
}