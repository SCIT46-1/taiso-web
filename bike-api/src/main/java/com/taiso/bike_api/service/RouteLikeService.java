package com.taiso.bike_api.service;

import com.taiso.bike_api.domain.RouteEntity;
import com.taiso.bike_api.domain.RouteLikeEntity;
import com.taiso.bike_api.domain.UserEntity;
import com.taiso.bike_api.dto.RouteLikeDTO;
import com.taiso.bike_api.repository.RouteLikeRepository;
import com.taiso.bike_api.repository.RouteRepository;
import com.taiso.bike_api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class RouteLikeService {

    @Autowired
    private RouteRepository routeRepository;

    @Autowired
    private RouteLikeRepository routeLikeRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public RouteLikeDTO addLike(Long routeId, Long userId) {
        // 1. RouteEntity 조회 (존재하지 않으면 예외 처리)
        RouteEntity route = routeRepository.findById(routeId)
                .orElseThrow(() -> new RuntimeException("해당 루트를 찾을 수 없습니다."));

        // 2. UserEntity 조회 (존재하지 않으면 예외 처리)
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("해당 사용자 정보를 찾을 수 없습니다."));

        // 3. 중복 좋아요 체크 (이미 좋아요가 등록된 경우 예외 처리)
        Optional<RouteLikeEntity> existingLike = routeLikeRepository.findByRouteAndUser(route, user);
        if (existingLike.isPresent()) {
            throw new DataIntegrityViolationException("이미 좋아요를 등록하였습니다.");
        }

        // 4. 좋아요 등록
        RouteLikeEntity routeLikeEntity = RouteLikeEntity.builder()
                .route(route)
                .user(user)
                .build();

        routeLikeRepository.save(routeLikeEntity);

        // 5. 좋아요 카운트 증가
        route.setLikeCount(route.getLikeCount() + 1);
        routeRepository.save(route);

        // 6. 응답 DTO 반환
        return RouteLikeDTO.builder()
                .routeId(route.getRouteId())
                .userId(user.getUserId())
                .likedAt(routeLikeEntity.getLikedAt())
                .build();
    }
}
