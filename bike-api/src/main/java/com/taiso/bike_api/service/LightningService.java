package com.taiso.bike_api.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.concurrent.atomic.AtomicReference;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.taiso.bike_api.domain.BookmarkEntity.BookmarkType;
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
import com.taiso.bike_api.dto.LightningListResponseDTO;
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

        // lightningUserRepository.save(lightningUser);

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

    // 페이징 처리 된 리스트 조회
    public LightningListResponseDTO getLightningList (int page, int size, String gender, String bikeType, String date, String region, String level, String tags, String sort, String userEmail) {

        // 정렬 기준 설정
        Sort sortObj = Sort.unsorted();
        if (!sort.isEmpty()) {
            sortObj = Sort.by(sort).ascending();
        }

        // 페이지 요청 생성
        Pageable pageable = PageRequest.of(page, size, sortObj);
        
        // 필터링 조건 생성
        AtomicReference<Specification<LightningEntity>> specRef = 
            new AtomicReference<>(Specification.where(null));
        
        // 성별 필터
        if (gender != null && !gender.isEmpty()) {
            try {
                Gender genderEnum = Gender.valueOf(gender);
                specRef.set(specRef.get().and((root, query, criteriaBuilder) -> 
                    criteriaBuilder.equal(root.get("gender"), genderEnum)));
            } catch (IllegalArgumentException e) {
                log.error("잘못된 성별 값: {}", e.getMessage());
            }
        }
        
        // 자전거 타입 필터
        if (bikeType != null && !bikeType.isEmpty()) {
            try {
                BikeType bikeTypeEnum = BikeType.valueOf(bikeType);
                specRef.set(specRef.get().and((root, query, criteriaBuilder) -> 
                    criteriaBuilder.equal(root.get("bikeType"), bikeTypeEnum)));
            } catch (IllegalArgumentException e) {
                log.error("잘못된 자전거 타입 값: {}", e.getMessage());
            }
        }
        
        // 지역 필터
        if (region != null && !region.isEmpty()) {
            try {
                Region regionEnum = Region.valueOf(region);
                specRef.set(specRef.get().and((root, query, criteriaBuilder) -> 
                    criteriaBuilder.equal(root.get("region"), regionEnum)));
            } catch (IllegalArgumentException e) {
                log.error("잘못된 지역 값: {}", e.getMessage());
            }
        }
        
        // 레벨 필터
        if (level != null && !level.isEmpty()) {
            try {
                Level levelEnum = Level.valueOf(level);
                specRef.set(specRef.get().and((root, query, criteriaBuilder) -> 
                    criteriaBuilder.equal(root.get("level"), levelEnum)));
            } catch (IllegalArgumentException e) {
                log.error("잘못된 레벨 값: {}", e.getMessage());
            }
        }
        
        // 태그 필터
        if (tags != null && !tags.isEmpty()) {
            String[] tagArray = tags.split(",");
            specRef.set(specRef.get().and((root, query, criteriaBuilder) -> {
                Join<LightningEntity, LightningTagCategoryEntity> tagJoin = root.join("tags");
                return tagJoin.get("name").in((Object[]) tagArray);
            }));
        }
        
        // 날짜 필터 
        if (date != null && !date.isEmpty()) {
            try {
                // LocalDate 형식으로 파싱 (예: "2023-12-25")
                java.time.LocalDate parsedDate = java.time.LocalDate.parse(date);

                specRef.set(specRef.get().and((root, query, criteriaBuilder) -> {
                    // eventDate는 LocalDateTime이므로 toLocalDate()로 날짜 부분만 비교
                    return criteriaBuilder.equal(
                            criteriaBuilder.function("date", java.sql.Date.class, root.get("eventDate")),
                            java.sql.Date.valueOf(parsedDate));
                }));
            } catch (Exception e) {
                log.error("Date parsing error: {}", e.getMessage());
            }
        }
        //클럽 전용인 번개는 제외
        specRef.set(specRef.get().and((root, query, criteriaBuilder) -> 
            criteriaBuilder.equal(root.get("isClubOnly"), false))); 



        // 필터링된 데이터로 페이징 조회
        Page<LightningEntity> lightningPage = lightningRepository.findAll(specRef.get(), pageable);

        // 응답 DTO생성 - 빌더 패턴 사용
        List<ResponseComponentDTO> lightningDTO = lightningPage.getContent().stream()
                .map(lightning -> {
                    // 기본 DTO 생성
                    ResponseComponentDTO dto = ResponseComponentDTO.builder()
                            .lightningId(lightning.getLightningId())
                            .creatorId(lightning.getCreatorId())
                            .title(lightning.getTitle())
                            .eventDate(lightning.getEventDate())
                            .duration(lightning.getDuration())
                            .createdAt(lightning.getCreatedAt())
                            .status(lightning.getStatus())
                            .capacity(lightning.getCapacity())
                            .gender(lightning.getGender())
                            .level(lightning.getLevel())
                            .bikeType(lightning.getBikeType())
                            .tags(lightning.getTags().stream()
                                    .map(LightningTagCategoryEntity::getName)
                                    .collect(Collectors.toList()))
                            .address(lightning.getAddress())
                            .routeImgId(lightning.getRoute() != null ? lightning.getRoute().getRouteImgId() : null)
                            .build();
                    
                    // 북마크 정보는 별도로 채워넣기
                    if (userEmail != null && !userEmail.isEmpty()) {
                        try {
                            UserEntity user = userRepository.findByEmail(userEmail).orElse(null);
                            if (user != null) {
                                // 별도 쿼리로 북마크 여부 확인
                                boolean isBookmarked = bookmarkRepository.existsByUser_UserIdAndTargetIdAndTargetType(
                                    user.getUserId(), 
                                    lightning.getLightningId(),
                                    BookmarkType.LIGHTNING
                                );
                                dto.setBookmarked(isBookmarked);
                            }
                        } catch (Exception e) {
                            // 오류 무시 - 사용자에게 표시할 데이터에 영향을 주지 않음
                            log.error("사용자 북마크 확인 중 오류: {}", e.getMessage());
                        }
                    }
                    
                    return dto;
                })
                .collect(Collectors.toList());

        // 현재 참여자 수 계산
        for (ResponseComponentDTO lightning : lightningDTO) {
            int currentParticipants = lightningUserRepository.countByLightning_LightningIdAndParticipantStatusInApprovedAndCompleted(lightning.getLightningId());
            lightning.setCurrentParticipants(currentParticipants);
        }

        return LightningListResponseDTO.builder()
                .content(lightningDTO)
                .pageNo(lightningPage.getNumber() + 1)
                .pageSize(lightningPage.getSize())
                .totalElements(lightningPage.getTotalElements())
                .totalPages(lightningPage.getTotalPages())
                .last(lightningPage.isLast())
                .build();
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
    
    // 클럽 전용 번개 조회
    public LightningListResponseDTO getClubLightningList(Long clubId, String userEmail) {
        // 클럽 ID에 해당하는 번개만 조회하는 Specification 생성
        Specification<LightningEntity> spec = (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            
            // 클럽 ID 필터링
            predicates.add(criteriaBuilder.equal(root.get("clubId"), clubId));
            
            // 클럽 전용 번개만 조회
            predicates.add(criteriaBuilder.equal(root.get("isClubOnly"), true));
            
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
        
        // 기본 정렬 기준 설정 (최신순)
        Sort sortObj = Sort.by("createdAt").descending();
        
        // 페이지 요청 생성 (첫 페이지, 적절한 사이즈)
        Pageable pageable = PageRequest.of(0, 8, sortObj);
        
        // 필터링된 데이터로 페이징 조회
        Page<LightningEntity> lightningPage = lightningRepository.findAll(spec, pageable);
        
        // 응답 DTO 생성
        List<ResponseComponentDTO> lightningDTO = lightningPage.getContent().stream()
                .map(lightning -> {
                    // 기본 DTO 생성
                    ResponseComponentDTO dto = ResponseComponentDTO.builder()
                            .lightningId(lightning.getLightningId())
                            .creatorId(lightning.getCreatorId())
                            .title(lightning.getTitle())
                            .eventDate(lightning.getEventDate())
                            .duration(lightning.getDuration())
                            .createdAt(lightning.getCreatedAt())
                            .status(lightning.getStatus())
                            .capacity(lightning.getCapacity())
                            .gender(lightning.getGender())
                            .level(lightning.getLevel())
                            .bikeType(lightning.getBikeType())
                            .tags(lightning.getTags().stream()
                                    .map(LightningTagCategoryEntity::getName)
                                    .collect(Collectors.toList()))
                            .address(lightning.getAddress())
                            .routeImgId(lightning.getRoute() != null ? lightning.getRoute().getRouteImgId() : null)
                            .build();
                    
                    // 북마크 정보는 별도로 채워넣기
                    if (userEmail != null && !userEmail.isEmpty()) {
                        try {
                            UserEntity user = userRepository.findByEmail(userEmail).orElse(null);
                            if (user != null) {
                                // 별도 쿼리로 북마크 여부 확인
                                boolean isBookmarked = bookmarkRepository.existsByUser_UserIdAndTargetIdAndTargetType(
                                    user.getUserId(), 
                                    lightning.getLightningId(),
                                    BookmarkType.LIGHTNING
                                );
                                dto.setBookmarked(isBookmarked);
                            }
                        } catch (Exception e) {
                            log.error("사용자 북마크 확인 중 오류: {}", e.getMessage());
                        }
                    }
                    
                    return dto;
                })
                .collect(Collectors.toList());
        
        // 현재 참여자 수 계산
        for (ResponseComponentDTO lightning : lightningDTO) {
            int currentParticipants = lightningUserRepository.countByLightning_LightningIdAndParticipantStatusInApprovedAndCompleted(lightning.getLightningId());
            lightning.setCurrentParticipants(currentParticipants);
        }
        
        return LightningListResponseDTO.builder()
                .content(lightningDTO)
                .pageNo(lightningPage.getNumber() + 1)
                .pageSize(lightningPage.getSize())
                .totalElements(lightningPage.getTotalElements())
                .totalPages(lightningPage.getTotalPages())
                .last(lightningPage.isLast())
                .build();
    }
}
