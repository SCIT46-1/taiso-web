package com.taiso.bike_api.controller;

import java.io.UnsupportedEncodingException;
import java.math.BigDecimal;
import java.net.URLEncoder;
import java.security.Principal;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.reactive.function.client.WebClient;

import com.taiso.bike_api.domain.LightningEntity;
import com.taiso.bike_api.domain.UserEntity;
import com.taiso.bike_api.domain.UserStravaDataEntity;
import com.taiso.bike_api.dto.UserStravaDataResponseDTO;
import com.taiso.bike_api.repository.LightningRepository;
import com.taiso.bike_api.repository.UserRepository;
import com.taiso.bike_api.repository.UserStravaDataRepository;

import io.swagger.v3.oas.annotations.Operation;

//TODO: 스트라바 연동 관련 컨트롤러 url 환경변수로 관리 필요
@RestController
@RequestMapping("/api/strava")
public class StravaLinkController {

    @Value("${strava.client.id}")
    private String clientId;

    @Value("${strava.client.secret}")
    private String clientSecret;

    @Value("${strava.redirect.uri}")
    private String redirectUri;

    @Autowired
    private final UserRepository userRepository;
    
    @Autowired
    private final LightningRepository lightningRepository;
    
    @Autowired
    private final UserStravaDataRepository userStravaDataRepository;

    public StravaLinkController(UserRepository userRepository, 
                               LightningRepository lightningRepository,
                               UserStravaDataRepository userStravaDataRepository) {
        this.userRepository = userRepository;
        this.lightningRepository = lightningRepository;
        this.userStravaDataRepository = userStravaDataRepository;
    }

    // 1. Strava 인증 URL 제공 (Connect Strava 버튼 클릭 시 사용)
    @GetMapping("/link")
    public ResponseEntity<String> getStravaAuthorizationUrl() {
        String authorizationUrl = "https://www.strava.com/oauth/authorize" +
                "?client_id=" + clientId +
                "&response_type=code" +
                "&redirect_uri=" + redirectUri +
                "&approval_prompt=auto" +
                "&scope=activity:read";
        return ResponseEntity.ok(authorizationUrl);
    }

    // 2. Strava 인증 후 콜백: authorization code를 받아 토큰 교환 후 사용자 정보 업데이트
    @GetMapping("/link/callback")
    public ResponseEntity<?> linkStravaAccount(
            @RequestParam("code") String code, 
            @RequestParam(value = "redirect_uri", required = false) String frontendRedirectUri,
            Principal principal) {
        RestTemplate restTemplate = new RestTemplate();

        System.out.println("code == " + code);
        // 토큰 교환을 위한 파라미터 준비
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("client_id", clientId);
        params.add("client_secret", clientSecret);
        params.add("code", code);
        params.add("grant_type", "authorization_code");

        // 프론트엔드 리다이렉트 URI가 없으면 기본값 사용
        if (frontendRedirectUri == null || frontendRedirectUri.isEmpty()) {
            frontendRedirectUri = "http://localhost:3000/strava-success"; // 기본 리다이렉트 URL 설정
        }

        try {
            // Strava 토큰 교환 API 호출
            String tokenUrl = "https://www.strava.com/oauth/token";
            ResponseEntity<Map> response = restTemplate.postForEntity(tokenUrl, params, Map.class);

            if (response.getStatusCode() == HttpStatus.OK) {
                Map<String, Object> body = response.getBody();
                String accessToken = (String) body.get("access_token");
                String refreshToken = (String) body.get("refresh_token");
                // athlete 객체 내에 athlete의 id가 포함되어 있음
                Map<String, Object> athlete = (Map<String, Object>) body.get("athlete");
                Integer athleteId = (Integer) athlete.get("id");

                // 현재 로그인된 사용자 정보(Principal에서 username을 받아온다고 가정)
                UserEntity user = userRepository.findByEmail(principal.getName())
                        .orElseThrow(() -> new RuntimeException("User not found"));

                // 사용자 계정에 Strava 연동 정보 저장
                user.setStravaAccessToken(accessToken);
                user.setStravaId(Long.valueOf(athleteId));
                user.setStravaRefreshToken(refreshToken);

                userRepository.save(user);
                
                // 성공 시 프론트엔드 성공 페이지로 리다이렉트
                String successUrl = frontendRedirectUri + "?status=success&message=" + 
                        URLEncoder.encode("Strava 계정이 성공적으로 연동되었습니다.", "UTF-8");
                return ResponseEntity.status(HttpStatus.FOUND)
                        .header(HttpHeaders.LOCATION, successUrl)
                        .build();
            } else {
                // 실패 시 프론트엔드 실패 페이지로 리다이렉트
                String failureUrl = frontendRedirectUri + "?status=error&message=" + 
                        URLEncoder.encode("Strava 계정 연동에 실패했습니다.", "UTF-8");
                return ResponseEntity.status(HttpStatus.FOUND)
                        .header(HttpHeaders.LOCATION, failureUrl)
                        .build();
            }
        } catch (Exception e) {
            try {
                // 예외 발생 시 프론트엔드 오류 페이지로 리다이렉트
                String errorUrl = frontendRedirectUri + "?status=error&message=" + 
                        URLEncoder.encode("Strava 연동 중 오류가 발생했습니다: " + e.getMessage(), "UTF-8");
                return ResponseEntity.status(HttpStatus.FOUND)
                        .header(HttpHeaders.LOCATION, errorUrl)
                        .build();
            } catch (UnsupportedEncodingException ex) {
                // 인코딩 오류 시 기본 에러 메시지 사용
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("서버 오류가 발생했습니다.");
            }
        }
    }

    /**
     * 현재 로그인한 사용자의 Strava 활동 목록을 페이징하여 가져오는 엔드포인트
     * Strava API는 page가 1부터 시작합니다(0이 아님)
     */
    @GetMapping("/activities")
    public ResponseEntity<?> getStravaActivities(
            Principal principal,
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "per_page", defaultValue = "30") int perPage) {
        
        // 로그인된 사용자 정보 조회
        UserEntity user = userRepository.findByEmail(principal.getName())
                .orElse(null);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("사용자를 찾을 수 없습니다.");
        }

        String accessToken = user.getStravaAccessToken();
        if (accessToken == null || accessToken.isEmpty()) {
            return ResponseEntity.badRequest().body("Strava 계정이 연동되지 않았습니다.");
        }

        // WebClient를 사용하여 Strava API 호출
        WebClient webClient = WebClient.builder()
                .baseUrl("https://www.strava.com/api/v3")
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                .build();

        try {
            // Strava의 /athlete/activities 엔드포인트 호출하여 활동 정보 조회
            // 페이징 파라미터 추가
            List<Map<String, Object>> activities = webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/athlete/activities")
                            .queryParam("page", page)
                            .queryParam("per_page", perPage)
                            .build())
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<List<Map<String, Object>>>() {})
                    .block();

            // 총 항목 수를 가져옵니다 (Strava API는 총 항목 수를 제공하지 않음)
            // 대신 Spring의 PageImpl을 사용하여 현재 페이지 데이터로 페이지 객체 생성
            Pageable pageable = PageRequest.of(page - 1, perPage); // Spring은 0부터 시작하므로 page - 1
            Page<Map<String, Object>> pageResult = new PageImpl<>(activities, pageable, 
                    // 현재로서는 정확한 총 갯수를 알 수 없어 추정값 사용
                    (long) activities.size() + (page > 1 ? (page - 1) * perPage : 0));

            // 페이지 정보와 함께 결과를 맵으로 구성
            Map<String, Object> response = Map.of(
                    "content", activities,
                    "page", page,
                    "size", perPage,
                    "hasMore", activities.size() == perPage // 결과 크기가 요청한 페이지 크기와 같으면 더 많은 데이터가 있을 가능성이 높음
            );

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Strava 활동 정보를 가져오는 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    /**
     * Strava 활동을 특정 번개 모임과 연결하고 저장하는 엔드포인트
     */
    @PostMapping("/activities/{activityId}/lightning/{lightningId}")
    public ResponseEntity<?> saveStravaActivityToLightning(
            @PathVariable("activityId") Long activityId,
            @PathVariable("lightningId") Long lightningId,
            Principal principal) {
        
        // 로그인된 사용자 정보 조회
        UserEntity user = userRepository.findByEmail(principal.getName())
                .orElse(null);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("사용자를 찾을 수 없습니다.");
        }

        // 번개 모임 조회
        LightningEntity lightning = lightningRepository.findById(lightningId)
                .orElse(null);
                
        if (lightning == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("해당 번개 모임을 찾을 수 없습니다.");
        }

        // 중복 확인
        boolean exists = userStravaDataRepository.existsByUserAndLightningAndActivityId(user, lightning, activityId);
        if (exists) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("이미 해당 활동이 번개 모임에 등록되어 있습니다.");
        }

        String accessToken = user.getStravaAccessToken();
        if (accessToken == null || accessToken.isEmpty()) {
            return ResponseEntity.badRequest().body("Strava 계정이 연동되지 않았습니다.");
        }

        // WebClient를 사용하여 특정 활동의 상세 정보 조회
        WebClient webClient = WebClient.builder()
                .baseUrl("https://www.strava.com/api/v3")
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                .build();

        try {
            // 특정 활동의 상세 정보 조회 
            Map<String, Object> activity = webClient.get()
                    .uri("/activities/" + activityId)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                    .block();
            
            // 안전한 타입 변환을 위한 처리
            Integer movingTime = null;
            if (activity.get("moving_time") != null) {
                if (activity.get("moving_time") instanceof Integer) {
                    movingTime = (Integer) activity.get("moving_time");
                } else if (activity.get("moving_time") instanceof Double) {
                    movingTime = ((Double) activity.get("moving_time")).intValue();
                } else {
                    movingTime = Integer.valueOf(activity.get("moving_time").toString());
                }
            }
            
            Integer calories = null;
            if (activity.get("calories") != null) {
                if (activity.get("calories") instanceof Integer) {
                    calories = (Integer) activity.get("calories");
                } else if (activity.get("calories") instanceof Double) {
                    calories = ((Double) activity.get("calories")).intValue();
                } else {
                    calories = Integer.valueOf(activity.get("calories").toString());
                }
            }
            
            // 활동 정보를 UserStravaDataEntity로 변환하여 저장
            UserStravaDataEntity stravaData = UserStravaDataEntity.builder()
                    .user(user)
                    .lightning(lightning)
                    .activityId(activityId)
                    .name((String) activity.get("name"))
                    .movingTime(movingTime)
                    .distance(new BigDecimal(activity.get("distance").toString()))
                    .elevation(activity.get("total_elevation_gain") != null 
                            ? new BigDecimal(activity.get("total_elevation_gain").toString()) 
                            : BigDecimal.ZERO)
                    .calories(calories)
                    .build();
            
            userStravaDataRepository.save(stravaData);
            
            return ResponseEntity.ok("Strava 활동이 번개 모임에 성공적으로 등록되었습니다.");
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Strava 활동 정보를 가져오는 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    /**
     * 특정 번개 모임에 대한 모든 사용자의 Strava 활동 데이터를 페이징하여 조회
     */
    @GetMapping("/lightning/{lightningId}/activities")
    @Operation(summary = "특정 번개 모임에 대한 모든 사용자의 Strava 활동 데이터를 페이징하여 조회")
    public ResponseEntity<?> getLightningStravaActivities(
            @PathVariable("lightningId") Long lightningId,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(value = "sort", defaultValue = "stravaDataId") String sort,
            @RequestParam(value = "direction", defaultValue = "DESC") String direction) {
        
        try {
            Sort.Direction sortDirection = direction.equalsIgnoreCase("ASC") ? 
                    Sort.Direction.ASC : Sort.Direction.DESC;
            
            Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sort));
            
            Page<UserStravaDataEntity> activities = 
                    userStravaDataRepository.findByLightningLightningId(lightningId, pageable);
            
            return ResponseEntity.ok(activities);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("활동 데이터 조회 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
    
    /**
     * 현재 사용자의 특정 번개 모임 Strava 활동 데이터 조회
     */
    @GetMapping("/lightning/{lightningId}/my-activity")
    @Operation(summary = "현재 사용자의 특정 번개 모임 Strava 활동 데이터 조회")
    public ResponseEntity<UserStravaDataResponseDTO> getUserLightningActivity(
            @PathVariable("lightningId") Long lightningId,
            Principal principal) {
        
        UserEntity user = userRepository.findByEmail(principal.getName()).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }
        
        try {
            UserStravaDataEntity activityEntity = userStravaDataRepository
                    .findByUserAndLightningLightningId(user, lightningId)
                    .orElse(null);
            
            if (activityEntity == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(null);
            }
            
            // Convert entity to DTO
            UserStravaDataResponseDTO activity = UserStravaDataResponseDTO.builder()
                    .stravaDataId(activityEntity.getStravaDataId())
                    .activityId(activityEntity.getActivityId())
                    .calories(activityEntity.getCalories() != null ? activityEntity.getCalories().toString() : null)
                    .distance(activityEntity.getDistance() != null ? activityEntity.getDistance().toString() : null)
                    .name(activityEntity.getName())
                    .movingTime(activityEntity.getMovingTime() != null ? activityEntity.getMovingTime().toString() : null)
                    .elevation(activityEntity.getElevation() != null ? activityEntity.getElevation().toString() : null)
                    .build();
            
            return ResponseEntity.ok(activity);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(null);
        }
    }
}