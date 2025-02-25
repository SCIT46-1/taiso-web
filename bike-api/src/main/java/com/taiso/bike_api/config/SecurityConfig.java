package com.taiso.bike_api.config;

import java.util.Arrays;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.taiso.bike_api.security.JwtAccessDeniedHandler;
import com.taiso.bike_api.security.JwtAuthenticationEntryPoint;
import com.taiso.bike_api.security.JwtAuthenticationFilter;
import com.taiso.bike_api.security.JwtTokenProvider;

import lombok.RequiredArgsConstructor;


@Configuration
@EnableWebSecurity  
@RequiredArgsConstructor
public class SecurityConfig {

    // JwtTokenProvider 주입
    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    @Autowired
    private JwtAccessDeniedHandler jwtAccessDeniedHandler;


    
    /**
     * SecurityFilterChain 빈을 등록하여 스프링 시큐리티 설정을 구성합니다.
     *
     * - CSRF : REST API를 사용할 경우 stateless 하게 구성하기 위해 비활성화
     * - SessionManagement : 세션을 사용하지 않고, stateless 방식 적용 (예, JWT 기반)
     * - URL 권한 설정 : 인증 없이 접근할 수 있는 엔드포인트와 인증이 필요한 엔드포인트를 분리
     * - H2 Console 접근 : 개발 시 H2 콘솔을 iframe 내에서 볼 수 있도록 설정
     */

         @Bean
         public JwtAuthenticationFilter jwtAuthenticationFilter() {
             return new JwtAuthenticationFilter(jwtTokenProvider);
         }
    

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // CORS 설정
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            // CSRF 비활성화 (REST API인 경우, 상태 비저장 방식 사용 시 주의)
            .csrf(csrf -> csrf.disable())
            
            // Stateless 세션 정책 설정
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            
            // URL 접근 권한 설정
            .authorizeHttpRequests(auth -> auth
                // 인증 없이 접근 가능한 URL (예: 인증 관련 엔드포인트, H2 콘솔)
                //TODO: 권한 관련 수정 필요
                .requestMatchers("/api/auth/**", "/h2-console/**", "/swagger-ui/**", "/v3/api-docs/**", "/api/auth/kakao", "/api/lightning").permitAll()

                // 그 외 모든 요청은 인증 필요
                .anyRequest().authenticated()
                );

            
         http.addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);

        // 인증 예외 처리
        http.exceptionHandling(exceptionHandling -> exceptionHandling
            .authenticationEntryPoint(jwtAuthenticationEntryPoint)
            .accessDeniedHandler(jwtAccessDeniedHandler)
        );
         
        // H2 콘솔 사용을 위한 추가 설정 (iframe 내 접근 허용)
        http.headers(headers -> 
            headers.frameOptions(frameOptions -> frameOptions.sameOrigin())
        );

        return http.build();
    }

    /**
     * 패스워드 암호화용 PasswordEncoder 빈 등록 (BCrypt 사용)
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * 인증 관리자 빈 등록
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfiguration) throws Exception {
        return authConfiguration.getAuthenticationManager();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000")); // TODO: 프로덕션 도메인 추가
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Cache-Control", "Content-Type"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

}
