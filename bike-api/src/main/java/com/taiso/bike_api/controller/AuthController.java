package com.taiso.bike_api.controller;


import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.taiso.bike_api.dto.KakaoAuthResultDTO;
import com.taiso.bike_api.dto.LoginRequestDTO;
import com.taiso.bike_api.dto.LoginResponseDTO;
import com.taiso.bike_api.dto.RegisterRequestDTO;
import com.taiso.bike_api.dto.RegisterResponseDTO;
import com.taiso.bike_api.dto.UserInfoGetResponseDTO;
import com.taiso.bike_api.dto.UserPasswordUpdateRequestDTO;
import com.taiso.bike_api.security.JwtTokenProvider;
import com.taiso.bike_api.service.AuthService;
import com.taiso.bike_api.service.UserService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;



@RestController
@Slf4j
@RequestMapping("/api/auth")
@Tag(name = "인증 컨트롤러", description = "인증 관련 API")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;
    
    // 주입된 MemberService를 통해 회원가입을 처리
    @Autowired
    private UserService userService;
    
    @Autowired
    private AuthService authService;
    
    // 로그인
    @PostMapping("/login")
    @Operation(summary = "로그인", description = "사용자 인증 및 JWT 토큰 발급")
    public ResponseEntity<LoginResponseDTO> login(@Valid @RequestBody LoginRequestDTO loginRequestDTO, HttpServletResponse response) {
        log.info("loginRequestDTO: {}", loginRequestDTO);
        
        // 사용자 인증 수행
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(loginRequestDTO.getEmail(), loginRequestDTO.getPassword())
        );
            
        
        String jwt = jwtTokenProvider.generateToken(authentication.getName());
    
        // JWT를 HttpOnly, Secure 쿠키에 저장 (환경에 따라 secure 옵션은 개발 시 false로 설정할 수 있음)
        Cookie jwtCookie = new Cookie("jwt", jwt);
        jwtCookie.setHttpOnly(true);      // 자바스크립트에서 접근 불가능
        jwtCookie.setSecure(true);        // HTTPS 환경에서만 전송 (개발 환경이라면 false)
        jwtCookie.setPath("/");           // 모든 경로에서 쿠키 접근 허용
        jwtCookie.setMaxAge(60 * 10);       // 쿠키 유효기간 설정 (예: 1시간)
    
        // 응답 헤더에 쿠키 추가
        response.addCookie(jwtCookie);

        LoginResponseDTO loginResponseDTO = new LoginResponseDTO();
        loginResponseDTO.setUserEmail(authentication.getName());
        loginResponseDTO.setUserId(userService.getUserIdByEmail(authentication.getName()));

    
        return ResponseEntity.status(HttpStatus.OK).body(loginResponseDTO);
    }

    // 회원가입
    @PostMapping("/register")
    @Operation(summary = "회원가입", description = "사용자 회원가입 및 JWT 토큰 발급")
    public ResponseEntity<RegisterResponseDTO> register(@Valid @RequestBody RegisterRequestDTO registerRequestDTO, HttpServletResponse httpServletResponse) {
        // 회원가입 처리
        RegisterResponseDTO registerResponseDTO = userService.register(registerRequestDTO);



        // 가입된 사용자의 이메일을 기반으로 JWT 토큰 발급
        String jwt = jwtTokenProvider.generateToken(registerResponseDTO.getEmail());

        // JWT 토큰을 HttpOnly, Secure 쿠키에 저장
        Cookie jwtCookie = new Cookie("jwt", jwt);
        jwtCookie.setHttpOnly(true);      // 자바스크립트에서 접근 불가
        jwtCookie.setSecure(true);        // HTTPS 환경에서만 전송 (개발 환경에서는 옵션 변경 가능)
        jwtCookie.setPath("/");           // 모든 경로에서 쿠키 접근 허용
        jwtCookie.setMaxAge(60 * 60);      // 쿠키 유효기간 (예: 1시간)

        httpServletResponse.addCookie(jwtCookie);

        return ResponseEntity.status(HttpStatus.CREATED).body(registerResponseDTO);
    }

    // 로그아웃
    @PostMapping("/logout")
    @Operation(summary = "로그아웃", description = "쿠키 삭제를 통한 사용자 로그아웃")
    public ResponseEntity<Void> logout(HttpServletResponse response) {
        // 클라이언트 측 JWT 쿠키 삭제
        Cookie jwtCookie = new Cookie("jwt", null);
        jwtCookie.setHttpOnly(true); // 자바스크립트 접근 불가
        jwtCookie.setSecure(true); // HTTPS 환경에서만 전송
        jwtCookie.setPath("/"); // 모든 경로에서 쿠키 접근 허용
        jwtCookie.setMaxAge(0); // 0초: 즉시 삭제하도록 설정
        response.addCookie(jwtCookie);

        log.info("User logged out: JWT cookie cleared");
        return ResponseEntity.noContent().build(); // 204 No Content 반환
    }
    
    /**
     * 프론트엔드에서 인가 코드(code)를 POST로 전달하면
     * 카카오 인증 및 JWT 발급을 수행하고 JWT를 반환함.
     */
    @PostMapping("/kakao")
    @Operation(summary = "카카오 로그인", description = "카카오 인증 및 JWT 발급")
    public ResponseEntity<LoginResponseDTO> kakaoLogin(@RequestBody Map<String, String> body,
            HttpServletResponse response) {
        String code = body.get("code");
        if (code == null) {
            return ResponseEntity.badRequest().body(null);
        }

        // processKakaoLogin 메서드가 KakaoAuthResultDTO를 리턴하도록 수정되었습니다.
        KakaoAuthResultDTO result = authService.processKakaoLogin(code);

        // JWT를 쿠키에 저장
        Cookie jwtCookie = new Cookie("jwt", result.getJwtToken());
        jwtCookie.setHttpOnly(true);
        jwtCookie.setSecure(true);
        jwtCookie.setPath("/");
        jwtCookie.setMaxAge(60 * 10); // 예: 10분 유효
        response.addCookie(jwtCookie);

        // LoginResponseDTO를 채워 응답으로 전달
        LoginResponseDTO loginResponseDTO = new LoginResponseDTO();
        loginResponseDTO.setUserEmail(result.getUserEmail());
        loginResponseDTO.setUserId(result.getUserId());

        return ResponseEntity.status(HttpStatus.OK).body(loginResponseDTO);
    }    

    /**
     * 프론트엔드에서 호출하여 인증(로그인) 상태를 확인하는 엔드포인트.
     * JWT 쿠키를 통해 Spring Security가 인증한 경우, 사용자 정보를 반환한다.
     */
    @GetMapping("/me")
    @Operation(summary = "로그인 상태 확인", description = "JWT 쿠키를 확인하여 로그인 여부 및 사용자 정보를 반환")
    public ResponseEntity<Void> checkAuth(Authentication authentication) {
        // authentication 객체가 null 이거나 인증되지 않았다면, 401 응답을 반환
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.status(HttpStatus.OK).body(null);
    }


    // 회원가입 중복 체크
    @GetMapping("/check-email")
    @Operation(summary = "이메일 중복 체크", description = "이메일 중복 체크")
    public ResponseEntity<Boolean> checkEmail(@RequestParam(name = "email") String email) {
        return ResponseEntity.status(HttpStatus.OK).body(userService.checkEmail(email));
    }

    // 내 회원정보수정(비밀번호 수정)
    @PatchMapping("/me")
    @Operation(summary = "내 비밀번호 수정", description = "내 비밀번호 수정")
    public ResponseEntity<Void> updatePassword(
        @RequestBody UserPasswordUpdateRequestDTO requestDTO
        , @AuthenticationPrincipal String userEmail
        , HttpServletResponse response) {

        authService.updatePassword(requestDTO, userEmail);

        String jwt = jwtTokenProvider.generateToken(userEmail);
    
        // JWT를 HttpOnly, Secure 쿠키에 저장 (환경에 따라 secure 옵션은 개발 시 false로 설정할 수 있음)
        Cookie jwtCookie = new Cookie("jwt", jwt);
        jwtCookie.setHttpOnly(true);      // 자바스크립트에서 접근 불가능
        jwtCookie.setSecure(true);        // HTTPS 환경에서만 전송 (개발 환경이라면 false)
        jwtCookie.setPath("/");           // 모든 경로에서 쿠키 접근 허용
        jwtCookie.setMaxAge(60 * 10);       // 쿠키 유효기간 설정 (예: 1시간)
    
        // 응답 헤더에 쿠키 추가
        response.addCookie(jwtCookie);

        return ResponseEntity.status(HttpStatus.NO_CONTENT).body(null);
    }

    @GetMapping("/me/account")
    @Operation(summary = "로그인 상태 확인", description = "JWT 쿠키를 확인하여 로그인 여부 및 사용자 정보를 반환")
    public ResponseEntity<UserInfoGetResponseDTO> getUserInfo(Authentication authentication) {
        UserInfoGetResponseDTO responseDTO = authService.getUserInfo(authentication);
        return ResponseEntity.status(HttpStatus.OK).body(responseDTO);
    }

}
