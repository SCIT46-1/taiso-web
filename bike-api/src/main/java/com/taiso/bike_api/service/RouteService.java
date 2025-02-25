package com.taiso.bike_api.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import com.taiso.bike_api.domain.RouteEntity;
import com.taiso.bike_api.domain.RouteLikeEntity;
import com.taiso.bike_api.domain.RoutePointEntity;
import com.taiso.bike_api.domain.RouteTagCategoryEntity;
import com.taiso.bike_api.domain.UserEntity;
import com.taiso.bike_api.dto.RouteDetailResponseDTO;
import com.taiso.bike_api.dto.RouteListResponseDTO;
import com.taiso.bike_api.dto.RoutePointDTO;
import com.taiso.bike_api.dto.RouteResponseDTO;
import com.taiso.bike_api.exception.RouteDeleteAccessDeniedException;
import com.taiso.bike_api.exception.RouteLikeAlreadyExistsException;
import com.taiso.bike_api.exception.RouteLikeNotFoundException;
import com.taiso.bike_api.exception.RouteNotFoundException;
import com.taiso.bike_api.exception.UserNotFoundException;
import com.taiso.bike_api.repository.RouteLikeRepository;
import com.taiso.bike_api.repository.RoutePointRepository;
import com.taiso.bike_api.repository.RouteRepository;
import com.taiso.bike_api.repository.UserRepository;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class RouteService {

    @Autowired
    private RouteLikeRepository routeLikeRepository;

    @Autowired
    private RouteRepository routeRepository;

    @Autowired
    private RoutePointRepository routePointRepository;

    @Autowired
    private UserRepository userRepository;


    /** 
      @param routeId 루트 아이디
      @param userEmail 사용자 이메일
      @return RouteDetailResponseDTO 루트 상세 정보
      루트 아이디를 통해 루트 디테일 정보 조회
    */
    public RouteDetailResponseDTO getRouteById(Long routeId, String userEmail) {
        // 루트 아이디 오류 처리
        if (routeId == null || routeId <= 0) {
            throw new IllegalArgumentException(routeId + " 값은 올바르지 않음");
        }

        // 루트 아이디를 통해 루트 디테일 정보 조회
        RouteEntity routeEntity = routeRepository.findById(routeId)
                .orElseThrow(() -> new RouteNotFoundException(routeId + "번 루트를 찾을 수 없음"));

        // 루트 포인트 조회
        List<RoutePointEntity> routePoints = routePointRepository.findByRouteOrderBySequenceAsc(routeEntity);
        // 루트 포인트 리스트를 루트 포인트 DTO 리스트로 변환
        List<RoutePointDTO> pointResponses = routePoints.stream()
                .map(rp -> RoutePointDTO.builder()
                        .route_point_id(rp.getRoutePointId().toString())
                        .sequence(rp.getSequence())
                        .latitude(rp.getLatitude().floatValue())
                        .longitude(rp.getLongitude().floatValue())
                        .elevation(rp.getElevation() != null ? rp.getElevation().floatValue() : null)
                        .build())
                .collect(Collectors.toList());

        // 루트 태그 조회
        List<String> tags = routeEntity.getTags().stream()
                .map(RouteTagCategoryEntity::getName)
                .collect(Collectors.toList());

        // 사용자가 좋아요를 눌렀는지 여부 확인
        boolean liked = false;
        if (userEmail != null) {
            UserEntity userEntity = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new UserNotFoundException(userEmail + "번 유저를 찾을 수 없음"));
            liked = routeLikeRepository.existsByUser_UserIdAndRoute_RouteId(userEntity.getUserId(), routeId);
        }

        // 루트 디테일 정보 반환
        return RouteDetailResponseDTO.builder()
                .routeId(routeEntity.getRouteId())
                .routeImgId(routeEntity.getRouteImgId())
                .userId(routeEntity.getUserId())
                .routeName(routeEntity.getRouteName())
                .description(routeEntity.getDescription())
                .likeCount(routeEntity.getLikeCount())
                .originalFilePath(routeEntity.getOriginalFilePath())
                .tag(tags)
                .distance(routeEntity.getDistance().floatValue())
                .altitude(routeEntity.getAltitude().floatValue())
                .distanceType(routeEntity.getDistanceType().name())
                .altitudeType(routeEntity.getAltitudeType().name())
                .roadType(routeEntity.getRoadType().name())
                .createdAt(routeEntity.getCreatedAt().toString())
                .fileName(routeEntity.getFileName())
                .fileType(routeEntity.getFileType() != null ? routeEntity.getFileType().name() : null)
                .routePoint(pointResponses)
                .isLiked(liked)
                .build();
    }


    /** 
      @param authentication 인증 정보
      @param routeId 루트 아이디
      @throws UserNotFoundException 사용자를 찾을 수 없음
      @throws RouteNotFoundException 루트를 찾을 수 없음
      @throws RouteLikeAlreadyExistsException 이미 해당 루트를 좋아요했음
      @throws RuntimeException 좋아요 등록 실패
      루트 좋아요 등록
    */
    @Transactional
    public void postRouteLike(Authentication authentication, Long routeId) {
        // 사용자 조회
        UserEntity user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new UserNotFoundException("사용자를 찾을 수 없습니다."));
        // 루트 조회
        RouteEntity route = routeRepository.findById(routeId)
                .orElseThrow(() -> new RouteNotFoundException("루트를 찾을 수 없습니다."));
                
        // 이미 좋아요를 눌렀는지 확인
        if (routeLikeRepository.existsByUser_UserIdAndRoute_RouteId(user.getUserId(), routeId)) {
            throw new RouteLikeAlreadyExistsException("이미 해당 루트를 좋아요했습니다.");
        }

        // 좋아요 엔티티 생성
        RouteLikeEntity routeLike = RouteLikeEntity.toEntity(route, user);
        try {
            routeLikeRepository.save(routeLike);
            route.setLikeCount(route.getLikeCount() + 1);
        } catch (Exception e) {
            throw new RuntimeException("좋아요 등록 실패", e);
        }
    }

    /** 
      @param authentication 인증 정보
      @param routeId 루트 아이디
      @throws UserNotFoundException 사용자를 찾을 수 없음
      @throws RouteNotFoundException 루트를 찾을 수 없음
      @throws RouteLikeNotFoundException 해당 루트에 대한 좋아요가 존재하지 않음
      @throws RuntimeException 좋아요 삭제 실패
      루트 좋아요 삭제
    */
    @Transactional
    public void deleteRouteLike(Authentication authentication, Long routeId) {
        // 사용자 조회
        UserEntity user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new UserNotFoundException("사용자를 찾을 수 없습니다."));
        // 루트 조회
        RouteEntity route = routeRepository.findById(routeId)
                .orElseThrow(() -> new RouteNotFoundException("루트를 찾을 수 없습니다."));

        // 좋아요 조회
        RouteLikeEntity routeLike = routeLikeRepository.findByUser_UserIdAndRoute_RouteId(user.getUserId(), routeId)
                .orElseThrow(() -> new RouteLikeNotFoundException("해당 루트에 대한 좋아요가 존재하지 않습니다."));

        // 좋아요 삭제
        try {
            routeLikeRepository.delete(routeLike);
            route.setLikeCount(route.getLikeCount() - 1);
        } catch (Exception e) {
            throw new RuntimeException("좋아요 삭제 실패", e);
        }
    }

    /** 
      @param page 페이지 번호
      @param size 페이지 크기
      @param sort 정렬 기준
      @param distanceType 거리 유형
      @param altitudeType 고도 유형
      @param roadType 도로 유형
      @param tag 태그
      @return RouteListResponseDTO 루트 리스트 응답 DTO
      루트 리스트 조회
    */
    public RouteListResponseDTO getRouteList(int page, int size, String sort,
                                             String distanceType, String altitudeType,
                                             String roadType, String[] tag) {
        // 정렬 기준 설정
        Sort sortObj = Sort.unsorted();
        if (!sort.isEmpty()) {
            sortObj = Sort.by(sort).ascending();
        }
        // 페이지 요청 생성
        Pageable pageable = PageRequest.of(page, size, sortObj);

        // 루트 리스트 조회 조건 설정 (specification 활용 참고)
        Specification<RouteEntity> spec = Specification.where(null);

        // 거리 유형 조건 설정 
        if (distanceType != null && !distanceType.isEmpty()) {
            spec = spec.and((root, query, cb) ->
                    cb.equal(root.get("distanceType"), distanceType));
        }
        if (altitudeType != null && !altitudeType.isEmpty()) {
            spec = spec.and((root, query, cb) ->
                    cb.equal(root.get("altitudeType"), altitudeType));
        }
        if (roadType != null && !roadType.isEmpty()) {
            spec = spec.and((root, query, cb) ->
                    cb.equal(root.get("roadType"), roadType));
        }
        if (tag != null && tag.length > 0 && !tag[0].isEmpty()) {
            spec = spec.and((root, query, cb) -> {
                Join<RouteEntity, RouteTagCategoryEntity> tagsJoin = root.join("tags", JoinType.INNER);
                CriteriaBuilder.In<String> inClause = cb.in(tagsJoin.get("name"));
                for (String t : tag) {
                    inClause.value(t);
                }
                return inClause;
            });
        }

        // 루트 리스트 페이징 처리 
        // 페이징의 경우 레포지토리에서 직접 재정의 하지 않아도, 레포지토리에서 제공하는 findAll 메소드를 사용하여 페이징 처리 가능
        // spec의 경우에도 마찬가지로 레포지토리에서 JpaSpecificationExecutor 인터페이스를 직접 상속하여 사용 가능
        Page<RouteEntity> routePage = routeRepository.findAll(spec, pageable);

        // 루트 리스트 응답 DTO 생성
        List<RouteResponseDTO> routeResponseDTO = routePage.getContent().stream()
                .map(route -> new RouteResponseDTO(
                        route.getRouteId(),
                        route.getRouteImgId(),
                        route.getUserId(),
                        route.getRouteName(),
                        route.getLikeCount(),
                        route.getTags().stream()
                                .map(RouteTagCategoryEntity::getName)
                                .collect(Collectors.toList()),
                        route.getDistance() != null ? route.getDistance().floatValue() : null,
                        route.getAltitude() != null ? route.getAltitude().floatValue() : null,
                        route.getDistanceType() != null ? route.getDistanceType().toString() : null,
                        route.getAltitudeType() != null ? route.getAltitudeType().toString() : null,
                        route.getRoadType() != null ? route.getRoadType().toString() : null,
                        route.getCreatedAt() != null ? route.getCreatedAt().toString() : null
                ))
                .collect(Collectors.toList());
                

        return RouteListResponseDTO.builder()
                .content(routeResponseDTO)
                .pageNo(routePage.getNumber() + 1)
                .pageSize(routePage.getSize())
                .totalElements(routePage.getTotalElements())
                .totalPages(routePage.getTotalPages())
                .last(routePage.isLast())
                .build();
    }
    
    /** 
      @param routeId 루트 아이디
      @param userEmail 사용자 이메일
      @throws RouteNotFoundException 루트를 찾을 수 없음
      @throws UserNotFoundException 사용자를 찾을 수 없음
      @throws RouteDeleteAccessDeniedException 삭제 권한이 없음
      루트 삭제
    */
    public void deleteRoute(Long routeId, String userEmail) {
        // 루트 조회
        RouteEntity routeEntity = routeRepository.findById(routeId)
                .orElseThrow(() -> new RouteNotFoundException(routeId + "번 루트를 찾을 수 없음"));
        // 사용자 조회
        UserEntity userEntity = userRepository.findById(routeEntity.getUserId())
                .orElseThrow(() -> new UserNotFoundException("해당 루트를 만든 사용자를 찾을 수 없음"));
        // 사용자 이메일 조회
        if (!userEmail.equals(userEntity.getEmail())) {
            throw new RouteDeleteAccessDeniedException("삭제 권한이 없습니다.");
        }
        // 루트 삭제
        routeRepository.delete(routeEntity);
    }
}