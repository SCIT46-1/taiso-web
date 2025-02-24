package com.taiso.bike_api.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import javax.management.relation.Role;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.taiso.bike_api.domain.LightningEntity;
import com.taiso.bike_api.domain.LightningEntity.BikeType;
import com.taiso.bike_api.domain.LightningEntity.Gender;
import com.taiso.bike_api.domain.LightningEntity.Level;
import com.taiso.bike_api.domain.LightningEntity.Region;
import com.taiso.bike_api.domain.LightningTagCategoryEntity;
import com.taiso.bike_api.domain.LightningUserEntity;
import com.taiso.bike_api.domain.LightningUserEntity.ParticipantStatus;
import com.taiso.bike_api.domain.UserEntity;
import com.taiso.bike_api.dto.LightningGetRequestDTO;
import com.taiso.bike_api.dto.LightningGetResponseDTO;
import com.taiso.bike_api.dto.LightningRequestDTO;
import com.taiso.bike_api.dto.LightningResponseDTO;
import com.taiso.bike_api.dto.ResponseComponentDTO;
import com.taiso.bike_api.dto.LightningJoinAcceptResponseDTO;
import com.taiso.bike_api.repository.LightningRepository;
import com.taiso.bike_api.repository.LightningUserRepository;
import com.taiso.bike_api.repository.LightningTagCategoryRepository;
import com.taiso.bike_api.repository.RouteRepository;
import com.taiso.bike_api.repository.UserRepository;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class LightningService {
    
    @Autowired
    LightningRepository lightningRepository;

    LightningUserRepository lightningUserRepository;

    @Autowired
    RouteRepository routeRepository;

    @Autowired
    UserRepository userRepository;

    @Autowired
    LightningTagCategoryRepository lightningTagCategoryRepository;

    public LightningResponseDTO createLightning(LightningRequestDTO requestDTO, String userEmail) {
        // 태그 이름을 통해서 태그 엔티티 가져오기
        Set<LightningTagCategoryEntity> tags = requestDTO.getTags().stream()
            .map(tagName -> lightningTagCategoryRepository.findByName(tagName)
                    .orElseGet(() -> lightningTagCategoryRepository.save(
                            LightningTagCategoryEntity.builder().name(tagName).build())))
            .collect(Collectors.toSet());

        // 생성자의 정보 조회해오기
        UserEntity creator = userRepository.findByEmail(userEmail).get();

        // 루트가 존재하는지 확인하는 예외처리 필요
        // non null 컬럼에 null이 들어가는 경우의 예외처리
        // try{
            LightningEntity lightning = LightningEntity.builder()
            .creatorId(creator.getUserId())
            .title(requestDTO.getTitle())
            .description(requestDTO.getDescription())
            .eventDate(requestDTO.getEventDate())
            .duration(requestDTO.getDuration())
            .status(requestDTO.getStatus())
            .capacity(requestDTO.getCapacity())
            .latitude(requestDTO.getLatitude())
            .longitude(requestDTO.getLongitude())
            .gender(requestDTO.getGender())
            .level(requestDTO.getLevel())
            .recruitType(requestDTO.getRecruitType())
            .bikeType(requestDTO.getBikeType())
            .region(requestDTO.getRegion())
            .distance(requestDTO.getDistance())
            .route(routeRepository.findById(requestDTO.getRouteId()).get())
            .address(requestDTO.getAddress())
            .isClubOnly(requestDTO.getIsClubOnly())
            .clubId(requestDTO.getClubId())
            .tags(tags)
            .build();
        // } catch() {

        // }

        // 번개 - 사용자 관계 설정
        LightningUserEntity lightningUser = LightningUserEntity.builder()
            .lightning(lightning)
            .user(creator)
            .joinedAt(LocalDateTime.now()) // 명시적으로 설정 가능
            .role(LightningUserEntity.Role.번개생성자)
            .participantStatus(LightningUserEntity.ParticipantStatus.승인)
            .build();

        // 관계 대입
        lightning.getLightningUsers().add(lightningUser);
        creator.getLightningUsers().add(lightningUser);

        LightningEntity savedLightning = lightningRepository.save(lightning);

        return LightningResponseDTO.builder().lightningId(savedLightning.getLightningId()).build();
    }

    public LightningGetResponseDTO getLightning(LightningGetRequestDTO requestDTO) {
        List<LightningEntity> entities = lightningRepository.findAll(filterBy(
                                                            requestDTO.getGender(), 
                                                            requestDTO.getLevel(), 
                                                            requestDTO.getBikeType(), 
                                                            requestDTO.getRegion(), 
                                                            requestDTO.getTags()));

        log.info("테스트");
        LightningGetResponseDTO responseDTO = LightningGetResponseDTO.builder().lightnings(
            entities.stream().map(
                entity -> ResponseComponentDTO.builder()
                                            .lightningId(entity.getLightningId())
                                            .creatorId(entity.getCreatorId())
                                            .title(entity.getTitle())
                                            .eventDate(entity.getEventDate())
                                            .duration(entity.getDuration())
                                            .createdAt(entity.getCreatedAt())
                                            .status(entity.getStatus())
                                            .capacity(entity.getCapacity())
                                            .gender(entity.getGender())
                                            .level(entity.getLevel())
                                            .bikeType(entity.getBikeType())
                                            .tags(entity.getTags()
                                                    .stream()
                                                    .map(component -> component.getName())
                                                    .collect(Collectors.toList()))
                                            .address(entity.getAddress())
                                            .routeImgId(entity.getRoute() == null ? null : entity.getRoute().getRouteImgId())
                                            .build())
                                            .collect(Collectors.toList()))
                                            .build();

        return responseDTO;
    }

    // 가져올 번개리스트를 필터링하기 위한 필터를 반환하는 메서드
    // gender값이 null인 경우는 자동으로 필터링 기준에서 제외 하는 방식
    public static Specification<LightningEntity> filterBy(
        Gender gender, Level level, BikeType bikeType, Region region, List<String> tags
    ) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (gender != null) {
                predicates.add(criteriaBuilder.equal(root.get("gender"), gender));
            }
            if (level != null) {
                predicates.add(criteriaBuilder.equal(root.get("level"), level));
            }
            if (bikeType != null) {
                predicates.add(criteriaBuilder.equal(root.get("bikeType"), bikeType));
            }
            if (region != null) {
                predicates.add(criteriaBuilder.equal(root.get("region"), region));
            }
            if (tags != null && !tags.isEmpty()) {
                Join<LightningEntity, LightningTagCategoryEntity> tagJoin = root.join("tags");
                predicates.add(tagJoin.get("tagName").in(tags));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }

    
    // 번개 참가 수락
    public LightningJoinAcceptResponseDTO acceptJoinRequest(Long lightningId, Long userId, String requesterEmail) {
        // 1. 번개 이벤트 존재 여부 확인
        LightningEntity lightning = lightningRepository.findById(lightningId)
                .orElseThrow(() -> new IllegalArgumentException("번개 이벤트가 존재하지 않습니다."));

        // 2. 대상 사용자 조회
        UserEntity targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("해당 사용자의 참가 신청이 존재하지 않습니다."));

        // 3. 번개 참가 신청(번개 사용자) 조회
        LightningUserEntity joinRequest = lightningUserRepository.findByLightningAndUser(lightning, targetUser)
                .orElseThrow(() -> new IllegalArgumentException("해당 사용자의 참가 신청이 존재하지 않습니다."));

        // 4. 이미 승인된 경우 에러 발생
        if (joinRequest.getParticipantStatus() == ParticipantStatus.승인) {
            throw new IllegalArgumentException("해당 사용자는 이미 모임에 승인되었습니다.");
        }

        // 5. (권한 체크) - 요청자가 번개 이벤트 생성자이거나, 관리자인지 확인
        UserEntity requesterUser = userRepository.findByEmail(requesterEmail)
                .orElseThrow(() -> new IllegalArgumentException("요청자 정보가 존재하지 않습니다."));

        // 요청자가 관리자 역할("ADMIN")이거나, 이벤트 생성자(userId가 creatorId와 일치)여야 함
        if (!requesterUser.getRole().getRoleName().equalsIgnoreCase("ADMIN") &&
                !requesterUser.getUserId().equals(lightning.getCreatorId())) {
            throw new IllegalArgumentException("참가 수락 권한이 없습니다.");
        }

        // 6. 참가 상태 변경: 신청대기 -> 승인
        joinRequest.setParticipantStatus(ParticipantStatus.승인);
        joinRequest.setJoinedAt(LocalDateTime.now());
        lightningUserRepository.save(joinRequest);

        // 7. 응답 DTO 구성 (여기서는 username으로 대상 사용자의 이메일을 사용)
        String username = targetUser.getEmail();
        return LightningJoinAcceptResponseDTO.builder()
                .lightningId(lightning.getLightningId())
                .title(lightning.getTitle())
                .userId(targetUser.getUserId())
                .username(username)
                .message("번개 참가를 수락했습니다.")
                .joinedAt(joinRequest.getJoinedAt())
                .build();
    }

}
