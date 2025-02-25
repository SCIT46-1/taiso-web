package com.taiso.bike_api.service;

import java.util.NoSuchElementException;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import com.taiso.bike_api.domain.LightningEntity;
import com.taiso.bike_api.domain.LightningTagCategoryEntity;
import com.taiso.bike_api.dto.LightningDetailGetResponseDTO;
import com.taiso.bike_api.dto.LightningDetailUpdateGetResponseDTO;
import com.taiso.bike_api.dto.LightningDetailUpdateRequestDTO;
import com.taiso.bike_api.exception.LightningFullMemberException;
import com.taiso.bike_api.exception.LightningNotFoundException;
import com.taiso.bike_api.exception.NotPermissionException;
import com.taiso.bike_api.repository.LightningDetailRepository;
import com.taiso.bike_api.repository.LightningTagCategoryRepository;
import com.taiso.bike_api.repository.UserRepository;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class LightningDetailService {

    @Autowired
    UserRepository userRepository;

    @Autowired
    LightningDetailRepository lightningDetailRepository;

    @Autowired
    LightningTagCategoryRepository lightningTagCategoryRepository;

    // 번개 수정 화면에 기존 정보 뿌리기
    public LightningDetailUpdateGetResponseDTO getUpdateLightningDetail(Long lightningId,
                                         Authentication authentication) {
        if (lightningId == null || lightningId <= 0) {
            throw new NoSuchElementException(lightningId + "번개는 존재하지 않음");
        }

        // 사용자 ID 조회
        Long userId = userRepository.findByEmail(authentication.getName()).get().getUserId();
        // 해당 번개 조회
        Optional<LightningEntity> temp = lightningDetailRepository.findById(lightningId);

        if(!temp.isPresent()) {
            throw new LightningNotFoundException("존재하지 않는 번개 입니다.");
        }
        if(userId != temp.get().getCreatorId()) {
            throw new NotPermissionException("번개 생성자만 수정 할 수 있습니다.");
        }

        // 태그를 String 형태로 변환
        Set<String> tagNames = temp.get().getTags().stream()
                .map(LightningTagCategoryEntity::getName) // name 필드를 꺼내서 String으로 매핑
                .collect(Collectors.toSet());

        log.info("DB에서 꺼내온 태그들 : {}", tagNames.toString());

        // Entity->DTO
        LightningEntity lightning = temp.get();
        LightningDetailUpdateGetResponseDTO lightningDetailUpdateGetResponseDTO = LightningDetailUpdateGetResponseDTO.builder()
                .lightningId(lightning.getLightningId())
                .creatorId(lightning.getCreatorId())
                .title(lightning.getTitle())
                .description(lightning.getDescription())
                .status(lightning.getStatus().toString())
                .gender(lightning.getGender().toString())
                .level(lightning.getLevel().toString())
                .recruitType(lightning.getRecruitType().toString())
                .bikeType(lightning.getBikeType().toString())
                .region(lightning.getRegion().toString())
                .lightningTag(tagNames)
                .build();

        log.info("DTO로 변경 : {}", lightningDetailUpdateGetResponseDTO.toString());

        return lightningDetailUpdateGetResponseDTO;

    }

    // 번개 디테일 업데이트
    public void updateLightningDetail(LightningDetailUpdateRequestDTO lightningDetailUpdateRequestDTO,
                                      Authentication authentication) {

        //리퀘스트값 오류 처리
        if (lightningDetailUpdateRequestDTO == null) {
            throw new LightningNotFoundException("존재하지 않는 번개 입니다.");
        }
        log.info("작성받은 번개 확인: {}", lightningDetailUpdateRequestDTO.toString());

        // 사용자 ID 조회
        Long userId = userRepository.findByEmail(authentication.getName()).get().getUserId();
        // DTO로 DB에서 해당 번개 조회
        Optional<LightningEntity> temp = lightningDetailRepository.findById(lightningDetailUpdateRequestDTO.getLightningId());

        // 해당 번개가 없을 경우
        if (!temp.isPresent()) {
            throw new LightningNotFoundException("존재하지 않는 번개 입니다.");
        }
        // 번개 수정 권한이 없을 경우 (생성자와 유저가 불일치)
        if (!Objects.equals(userId, temp.get().getCreatorId())) {
            throw new NotPermissionException("번개 생성자만 수정 할 수 있습니다.");
        }

        LightningEntity entity = temp.get();

        // 모집상태가 아닌 번개는 수정 불가
        if (!Objects.equals(entity.getStatus().toString(), "모집") || entity.getStatus() == null) {
            throw new LightningFullMemberException("번개가 이미 완료 되었거나, 취소 되어서 수정할 수 없습니다.");
        }

        // DTO로 받은 tag를 Entity 형태로 변환
        Set<LightningTagCategoryEntity> tags = lightningDetailUpdateRequestDTO.getLightningTag().stream()
                .map(tagName -> lightningTagCategoryRepository.findByName(tagName)
                        .orElseGet(() -> lightningTagCategoryRepository.save(
                                LightningTagCategoryEntity.builder().name(tagName).build())))
                .collect(Collectors.toSet());

        log.info("들어온 번개의 태그: {}", tags.stream().map(LightningTagCategoryEntity::getName).collect(Collectors.joining(", ")));

        // 업데이트
        entity.setTitle(lightningDetailUpdateRequestDTO.getTitle());
        entity.setDescription(lightningDetailUpdateRequestDTO.getDescription());
        entity.setStatus(LightningEntity.LightningStatus.valueOf(lightningDetailUpdateRequestDTO.getStatus().toString()));
        entity.setGender(LightningEntity.Gender.valueOf(lightningDetailUpdateRequestDTO.getGender().toString()));
        entity.setLevel(LightningEntity.Level.valueOf(lightningDetailUpdateRequestDTO.getLevel().toString()));
        entity.setRecruitType(LightningEntity.RecruitType.valueOf(lightningDetailUpdateRequestDTO.getRecruitType().toString()));
        entity.setBikeType(LightningEntity.BikeType.valueOf(lightningDetailUpdateRequestDTO.getBikeType().toString()));
        entity.setRegion(LightningEntity.Region.valueOf(lightningDetailUpdateRequestDTO.getRegion().toString()));
        entity.setTags(tags);

        lightningDetailRepository.save(entity);
    }

    // 번개 디테일 조회
public LightningDetailGetResponseDTO getLightningDetail(Long lightningId) {

    // DB에서 번개를 찾아옴
    Optional<LightningEntity> temp = lightningDetailRepository.findById(lightningId);

    // 번개 미존재 처리
    if (!temp.isPresent()) {
        throw new LightningNotFoundException("존재하지 않는 번개 입니다.");
    }

    // 태그를 String 형태로 변환
    Set<String> tagNames = temp.get().getTags().stream()
            .map(LightningTagCategoryEntity::getName) // name 필드를 꺼내서 String으로 매핑
            .collect(Collectors.toSet());

    // entity -> dto
    LightningEntity lightning = temp.get();

    // route 객체가 null인지 체크 후 처리
    Long routeId = null;
    if (lightning.getRoute() != null) {
        routeId = lightning.getRoute().getRouteId();
    }

    LightningDetailGetResponseDTO lightningDetailGetResponseDTO = LightningDetailGetResponseDTO.builder()
            .lightningId(lightning.getLightningId())
            .creatorId(lightning.getCreatorId())
            .title(lightning.getTitle())
            .description(lightning.getDescription())
            .eventDate(lightning.getEventDate())
            .duration(lightning.getDuration())
            .createdAt(lightning.getCreatedAt())
            .status(lightning.getStatus().toString())
            .capacity(lightning.getCapacity())
            .latitude(lightning.getLatitude())
            .longitude(lightning.getLongitude())
            .gender(lightning.getGender().toString())
            .level(lightning.getLevel().toString())
            .recruitType(lightning.getRecruitType().toString())
            .bikeType(lightning.getBikeType().toString())
            .region(lightning.getRegion().toString())
            .distance(lightning.getDistance())
            .routeId(routeId)
            .address(lightning.getAddress())
            .isClubOnly(lightning.getIsClubOnly())
            .lightningTag(tagNames)
            .build();

    return lightningDetailGetResponseDTO;
}
}
