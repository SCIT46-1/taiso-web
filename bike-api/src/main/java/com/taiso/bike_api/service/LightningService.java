package com.taiso.bike_api.service;

import com.taiso.bike_api.domain.LightningEntity;
import com.taiso.bike_api.domain.LightningEntity.LightningStatus;
import com.taiso.bike_api.domain.LightningUserEntity;
import com.taiso.bike_api.domain.UserEntity;
import com.taiso.bike_api.dto.LightningResponseDTO;
import com.taiso.bike_api.dto.LightningTagDTO;
import com.taiso.bike_api.dto.LightningUserDTO;
import com.taiso.bike_api.repository.LightningUserRepository;
import com.taiso.bike_api.repository.UserRepository;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class LightningService {

    private final LightningUserRepository lightningUserRepository;
    private final UserRepository userRepository;

    @Autowired
    public LightningService(LightningUserRepository lightningUserRepository,
                            UserRepository userRepository) {
        this.lightningUserRepository = lightningUserRepository;
        this.userRepository = userRepository;
    }

    public List<LightningResponseDTO> getUserLightningEvents(String email, int statusParam) {
        // 1. 현재 사용자 조회
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // 2. 해당 사용자의 번개 참여 기록 조회
        List<LightningUserEntity> lightningUserEntities = lightningUserRepository.findByUser(user);
        if (lightningUserEntities.isEmpty()) {
            throw new IllegalArgumentException("아무런 번개가 존재하지 않습니다.");
        }

        // 3. 쿼리 파라미터에 따른 번개 이벤트 상태 필터 설정
        EnumSet<LightningStatus> statusFilter;
        if (statusParam == 1) {
            statusFilter = EnumSet.of(LightningStatus.모집, LightningStatus.마감);
        } else if (statusParam == 3) {
            statusFilter = EnumSet.of(LightningStatus.종료);
        } else {
            throw new IllegalArgumentException("Invalid status parameter");
        }

        // 4. 참여 기록에서 고유 번개 이벤트 추출 및 상태 필터 적용
        List<LightningEntity> lightningEntities = lightningUserEntities.stream()
                .map(LightningUserEntity::getLightning)
                .distinct()
                .filter(lightning -> statusFilter.contains(lightning.getStatus()))
                .collect(Collectors.toList());

        if (lightningEntities.isEmpty()) {
            throw new IllegalArgumentException("아무런 번개가 존재하지 않습니다.");
        }

        // 5. 각 LightningEntity를 DTO로 변환
        List<LightningResponseDTO> response = new ArrayList<>();
        for (LightningEntity lightning : lightningEntities) {
            // 해당 번개 이벤트의 모든 참여자(번개 사용자) 정보를 필터링
            List<LightningUserDTO> lightningUserDtos = lightningUserEntities.stream()
                    .filter(lu -> lu.getLightning().getLightningId().equals(lightning.getLightningId()))
                    .map(lu -> LightningUserDTO.builder()
                            .userId(lu.getUser().getUserId())
                            .build())
                    .collect(Collectors.toList());

            // 번개 이벤트에 연결된 태그 정보를 DTO로 매핑
            List<LightningTagDTO> tagDtos = lightning.getTags().stream()
                    .map(tag -> LightningTagDTO.builder()
                            .tag(tag.getName())
                            .build())
                    .collect(Collectors.toList());

            LightningResponseDTO dto = LightningResponseDTO.builder()
                    .lightningId(lightning.getLightningId())
                    .title(lightning.getTitle())
                    .creatorId(lightning.getCreatorId())
                    .status(lightning.getStatus().toString())
                    .eventDate(lightning.getEventDate())
                    .duration(lightning.getDuration())
                    .capacity(lightning.getCapacity())
                    .address(lightning.getAddress())
                    .lightningUsers(lightningUserDtos)
                    .tags(tagDtos)
                    .build();
            response.add(dto);
        }
        return response;
    }
}
