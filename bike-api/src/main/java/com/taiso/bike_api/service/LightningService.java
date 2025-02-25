package com.taiso.bike_api.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.taiso.bike_api.domain.LightningEntity;
import com.taiso.bike_api.domain.LightningEntity.BikeType;
import com.taiso.bike_api.domain.LightningEntity.Gender;
import com.taiso.bike_api.domain.LightningEntity.Level;
import com.taiso.bike_api.domain.LightningEntity.Region;
import com.taiso.bike_api.domain.LightningTagCategoryEntity;
import com.taiso.bike_api.domain.LightningUserEntity;
import com.taiso.bike_api.domain.RouteEntity;
import com.taiso.bike_api.domain.UserEntity;
import com.taiso.bike_api.dto.LightingParticipationCheckResponseDTO;
import com.taiso.bike_api.dto.LightningGetRequestDTO;
import com.taiso.bike_api.dto.LightningGetResponseDTO;
import com.taiso.bike_api.dto.LightningPostRequestDTO;
import com.taiso.bike_api.dto.LightningPostResponseDTO;
import com.taiso.bike_api.dto.ResponseComponentDTO;
import com.taiso.bike_api.exception.LightningCreateMissingValueException;
import com.taiso.bike_api.exception.LightningNotFoundException;
import com.taiso.bike_api.exception.LightningUserNotFoundException;
import com.taiso.bike_api.exception.RouteNotFoundException;
import com.taiso.bike_api.exception.UserNotFoundException;
import com.taiso.bike_api.repository.BookmarkRepository;
import com.taiso.bike_api.repository.LightningRepository;
import com.taiso.bike_api.repository.LightningTagCategoryRepository;
import com.taiso.bike_api.repository.LightningUserRepository;
import com.taiso.bike_api.repository.RouteRepository;
import com.taiso.bike_api.repository.UserDetailRepository;
import com.taiso.bike_api.repository.UserRepository;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class LightningService {
    
    @Autowired
    LightningRepository lightningRepository;

    @Autowired
    RouteRepository routeRepository;

    @Autowired
    UserRepository userRepository;

    @Autowired
    LightningTagCategoryRepository lightningTagCategoryRepository;

    @Autowired
    LightningUserRepository lightningUserRepository;

    @Autowired
    BookmarkRepository bookmarkRepository;

    @Autowired
    UserDetailRepository userDetailRepository;

    public LightningPostResponseDTO createLightning(LightningPostRequestDTO requestDTO, String userEmail) {
        // 태그 이름을 통해서 태그 엔티티 가져오기
        Set<LightningTagCategoryEntity> tags = requestDTO.getTags().stream()
            .map(tagName -> lightningTagCategoryRepository.findByName(tagName)
                    .orElseGet(() -> lightningTagCategoryRepository.save(
                            LightningTagCategoryEntity.builder().name(tagName).build())))
            .collect(Collectors.toSet());

        // 생성자의 정보 조회해오기
        UserEntity creator = userRepository.findByEmail(userEmail).get();

        // 루트가 존재하는지 확인하는 예외처리
        RouteEntity route = routeRepository.findById(requestDTO.getRouteId())
            .orElseThrow(() -> new RouteNotFoundException("루트가 존재하지 않습니다."));

        // 번개 엔티티 빌드
        // 필수 값이 누락되었을 경우 예외처리
        LightningEntity lightning;

        try{
            lightning = LightningEntity.builder()
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
            .route(route)
            .address(requestDTO.getAddress())
            .isClubOnly(requestDTO.getIsClubOnly())
            .clubId(requestDTO.getClubId())
            .tags(tags)
            .build();
        } catch(Exception e) {
            throw new LightningCreateMissingValueException("필수 값이 누락되었습니다.");

        }

        // 번개 - 사용자 관계 설정
        LightningUserEntity lightningUser = LightningUserEntity.builder()
            .lightning(lightning)
            .user(creator)
            .role(LightningUserEntity.Role.번개생성자)
            .participantStatus(LightningUserEntity.ParticipantStatus.승인)
            .build();

        // 관계 대입
        lightning.getLightningUsers().add(lightningUser);
        creator.getLightningUsers().add(lightningUser);

        LightningEntity savedLightning = lightningRepository.save(lightning);

        return LightningPostResponseDTO.builder().lightningId(savedLightning.getLightningId()).build();
    }

    public LightningGetResponseDTO getLightning(LightningGetRequestDTO requestDTO, Pageable pageable) {

        Page<LightningEntity> entities = lightningRepository.findAll(filterBy(
                                                            requestDTO.getGender(), 
                                                            requestDTO.getLevel(), 
                                                            requestDTO.getBikeType(), 
                                                            requestDTO.getRegion(), 
                                                            requestDTO.getTags())
                                                            , pageable);

        LightningGetResponseDTO responseDTO = LightningGetResponseDTO.builder().lightnings(
            entities.map(
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
                                            .build()))
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

    public LightingParticipationCheckResponseDTO getParticipationCheck(Long lightningId, String userEmail) {
        // 번개가 존재하는지 확인인
        LightningEntity lightning = lightningRepository.findById(lightningId)
            .orElseThrow(() -> new LightningNotFoundException("번개가 존재하지 않습니다."));

        // 사용자가 존재하는지 확인
        UserEntity user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new UserNotFoundException("사용자가 존재하지 않습니다."));

        // 사용자가 번개에 참여했는지 확인
        lightningUserRepository.findByLightningAndUser(lightning, user)
            .orElseThrow(() -> new LightningUserNotFoundException("번개에 참여하지 않은 사용자입니다."));

        // 번개 정보 반환
        return LightingParticipationCheckResponseDTO.builder()
            .lightningId(lightning.getLightningId())
            .title(lightning.getTitle())
            .eventDate(lightning.getEventDate())
            .duration(lightning.getDuration())
            .latitude(lightning.getLatitude())
            .longitude(lightning.getLongitude())
            .build();
    }
}