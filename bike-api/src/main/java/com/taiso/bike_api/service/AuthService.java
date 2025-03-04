package com.taiso.bike_api.service;

import java.util.Map;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import com.taiso.bike_api.config.KakaoProperties;
import com.taiso.bike_api.domain.UserDetailEntity;
import com.taiso.bike_api.dto.KakaoUserInfoDTO;
import com.taiso.bike_api.dto.UserInfoGetResponseDTO;
import com.taiso.bike_api.dto.UserPasswordUpdateRequestDTO;
import com.taiso.bike_api.domain.UserEntity;
import com.taiso.bike_api.dto.KakaoAuthResultDTO;
import com.taiso.bike_api.dto.KakaoUserInfoDTO;
import com.taiso.bike_api.exception.KakaoAuthenticationException;
import com.taiso.bike_api.exception.NotPermissionException;
import com.taiso.bike_api.exception.UserNotFoundException;
import com.taiso.bike_api.exception.WrongPasswordException;
import com.taiso.bike_api.repository.UserDetailRepository;
import com.taiso.bike_api.repository.UserRepository;
import com.taiso.bike_api.repository.UserRoleRepository;
import com.taiso.bike_api.repository.UserStatusRepository;
import com.taiso.bike_api.security.JwtTokenProvider;
import com.taiso.bike_api.util.RandomNickNameGenerator;

import jakarta.transaction.Transactional;

@Service
public class AuthService {

    private final KakaoProperties kakaoProperties;
    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final RestTemplate restTemplate;
    private final UserRoleRepository userRoleRepository;
    private final UserStatusRepository userStatusRepository;
    private final UserDetailRepository userDetailRepository;
    private PasswordEncoder passwordEncoder;


    public AuthService(KakaoProperties kakaoProperties,
                       UserRepository userRepository,
                       JwtTokenProvider jwtTokenProvider,
                       UserRoleRepository userRoleRepository,
                       UserStatusRepository userStatusRepository,
                       UserDetailRepository userDetailRepository) {
        this.kakaoProperties = kakaoProperties;
        this.userRepository = userRepository;
        this.jwtTokenProvider = jwtTokenProvider;
        this.restTemplate = new RestTemplate();
        this.userRoleRepository = userRoleRepository;
        this.userStatusRepository = userStatusRepository;
        this.userDetailRepository = userDetailRepository;
    }

    /**
     * 프론트엔드로부터 전달받은 인가 코드를 이용해
     * 카카오와 통신하고 JWT를 생성하여 반환함.
     */
    public KakaoAuthResultDTO processKakaoLogin(String code) {
        // 1. 인가 코드로 액세스 토큰 교환
        String accessToken = getKakaoAccessToken(code);
        System.out.println("accessToken: " + accessToken);
        // 2. 액세스 토큰으로 사용자 정보 조회
        KakaoUserInfoDTO kakaoUserInfo = getKakaoUserInfo(accessToken);
        System.out.println("kakaoUserInfo: " + kakaoUserInfo.getEmail());

        // 3. DB에 사용자 존재 여부 확인, 신규 가입 처리        
        UserEntity user = userRepository.findByEmail(kakaoUserInfo.getEmail())
                .orElseGet(() -> {
                    UserEntity newUser = new UserEntity();
                    newUser.setEmail(kakaoUserInfo.getEmail());
                    // Set the default role and status (you need to replace these with actual default values)
                    newUser.setRole(userRoleRepository.findByRoleName("USER").get());
                    newUser.setStatus(userStatusRepository.findByStatusName("ACTIVE").get());
                    newUser.setProvider("kakao");
                    
                    // 신규 유저 저장
                    UserEntity savedUser = userRepository.save(newUser);
                    userRepository.flush(); // 필요에 따라 flush 수행

                    // 랜덤 닉네임 생성
                    String randomNickname = RandomNickNameGenerator.generate();
                    

                    System.out.println("randomNickname: " + randomNickname);
                    // 신규 가입된 사용자에 대한 user detail 레코드 생성 및 연결
                    UserDetailEntity userDetail = UserDetailEntity.builder()
                            .user(savedUser)
                            .userNickname(randomNickname) // 랜덤 닉네임 설정
                            // 추가 필드가 필요하면 설정
                            .build();
                    userDetailRepository.save(userDetail);
                    
                    return savedUser;
                });

        // 4. JWT 생성 (여기서는 사용자 이메일을 기반으로 토큰 생성)
        String jwtToken = jwtTokenProvider.generateToken(user.getEmail());
        
        // KakaoAuthResultDTO에 JWT 토큰과 사용자 정보를 담아 반환
        return new KakaoAuthResultDTO(jwtToken, user.getUserId(), user.getEmail());
    }

    private String getKakaoAccessToken(String code) {
        String tokenUrl = "https://kauth.kakao.com/oauth/token";

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("grant_type", "authorization_code");
        params.add("client_id", kakaoProperties.getClientId());
        params.add("redirect_uri", kakaoProperties.getRedirectUri());
        params.add("code", code);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);
        ResponseEntity<Map> response = restTemplate.postForEntity(tokenUrl, request, Map.class);

        Map<String, Object> body = response.getBody();
        if (response.getStatusCode() == HttpStatus.OK && body != null) {
            String accessToken = (String) body.get("access_token");
            if (accessToken != null) {
                return accessToken;
            }
        }
        throw new KakaoAuthenticationException("카카오로부터 액세스 토큰을 받지 못했습니다.");
    }

    private KakaoUserInfoDTO getKakaoUserInfo(String accessToken) {
        String userInfoUrl = "https://kapi.kakao.com/v2/user/me";

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        HttpEntity<?> entity = new HttpEntity<>(headers);

        ResponseEntity<KakaoUserInfoDTO> response = restTemplate.exchange(
                userInfoUrl,
                HttpMethod.GET,
                entity,
                KakaoUserInfoDTO.class
        );

        if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
            return response.getBody();
        } else {
            throw new KakaoAuthenticationException("카카오로부터 사용자 정보를 받지 못했습니다.");
        }
    }

    @Transactional
    public void updatePassword(UserPasswordUpdateRequestDTO requestDTO, String userEmail) {
        // 유저 존재여부 확인
        UserEntity user = userRepository.findByEmail(userEmail).orElseThrow(
            () -> new UserNotFoundException("존재하지 않는 사용자입니다.")
        );

        // 기존 비밀번호입력 체크
        if(!passwordEncoder.matches(requestDTO.getCurrentPwd(), user.getPassword())) {
            throw new WrongPasswordException("잘못된 현재비밀번호입니다.");
        }

        // 새 비밀번호로 세팅
        user.setPassword(passwordEncoder.encode(requestDTO.getNewPwd()));

    }

    public UserInfoGetResponseDTO getUserInfo(Authentication authentication) {
        // Authentication이 null이거나 권한이 없을 경우의 예외처리
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new NotPermissionException("인증정보가 존재하지 않습니다.");
        }

        // 유저가 존재하지 않을 경우의 예외처리
        UserEntity user = userRepository.findByEmail(authentication.getName())
        .orElseThrow(() -> new UserNotFoundException("존재하지 않는 사용자입니다."));

        // UserInfoGetResponseDTO 빌드
        return UserInfoGetResponseDTO.builder()
                                     .userEmail(user.getEmail())
                                     .build();
    }

}