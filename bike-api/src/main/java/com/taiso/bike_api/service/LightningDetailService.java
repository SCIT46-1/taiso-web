package com.taiso.bike_api.service;

import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import com.taiso.bike_api.domain.ClubEntity;
import com.taiso.bike_api.domain.LightningEntity;
import com.taiso.bike_api.domain.LightningTagCategoryEntity;
import com.taiso.bike_api.domain.LightningUserEntity;
import com.taiso.bike_api.domain.RouteEntity;
import com.taiso.bike_api.domain.RoutePointEntity;
import com.taiso.bike_api.domain.UserDetailEntity;
import com.taiso.bike_api.domain.UserEntity;
import com.taiso.bike_api.dto.LightningDetailClubDTO;
import com.taiso.bike_api.dto.LightningDetailCreatorDTO;
import com.taiso.bike_api.dto.LightningDetailGetResponseDTO;
import com.taiso.bike_api.dto.LightningDetailMemberDTO;
import com.taiso.bike_api.dto.LightningDetailRouteDTO;
import com.taiso.bike_api.dto.LightningDetailUpdateGetResponseDTO;
import com.taiso.bike_api.dto.LightningDetailUpdateRequestDTO;
import com.taiso.bike_api.dto.RoutePointDTO;
import com.taiso.bike_api.exception.LightningFullMemberException;
import com.taiso.bike_api.exception.LightningNotFoundException;
import com.taiso.bike_api.exception.NotPermissionException;
import com.taiso.bike_api.exception.UserNotFoundException;
import com.taiso.bike_api.repository.BookmarkRepository;
import com.taiso.bike_api.repository.ClubRepository;
import com.taiso.bike_api.repository.LightningDetailRepository;
import com.taiso.bike_api.repository.LightningTagCategoryRepository;
import com.taiso.bike_api.repository.LightningUserRepository;
import com.taiso.bike_api.repository.UserDetailRepository;
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

    @Autowired
    UserDetailRepository userDetailRepository;

    @Autowired
    ClubRepository clubRepository;

    @Autowired
    LightningUserRepository lightningUserRepository;

    @Autowired
    BookmarkRepository bookmarkRepository;

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
    public LightningDetailGetResponseDTO getLightningDetail(Long lightningId, String userEmail) {

        // DB에서 번개를 찾아옴
        LightningEntity temp = lightningDetailRepository.findById(lightningId)
                .orElseThrow(() -> new NoSuchElementException("존재하지 않는 번개입니다."));

        log.info("번개 아이디 : {}", temp.getLightningId());

        // 태그 String 빌드
        Set<String> tagNames = temp.getTags().stream()
                .map(LightningTagCategoryEntity::getName) // name 필드를 꺼내서 String으로 매핑
                .collect(Collectors.toSet());

        // 번개 생성자 조회
        Long creatorId = temp.getCreatorId();
        log.info("번개 생성자 아이디 : {}",creatorId);

        // 번개 생성자 디테일 조회
        UserDetailEntity creatorDetail = userRepository.findById(temp.getCreatorId())
                .flatMap(user -> userDetailRepository.findById(user.getUserId()))
                .orElseThrow(() -> new UserNotFoundException("존재하지 않는 유저입니다."));

        // 번개 생성자 DTO 생성
        LightningDetailCreatorDTO creatorDTO = LightningDetailCreatorDTO.builder()
                .userId(creatorDetail.getUserId())
                .creatorNickname(creatorDetail.getUserNickname())
                .creatorProfileImg(creatorDetail.getUserProfileImg())
                .build();
        log.info("번개 생성자 디테일 : {}",creatorDTO);

        // 먼저 routeDTO와 clubDTO를 선언 (초기값은 null-> 값이 없을 수도 있으니까)
        LightningDetailRouteDTO routeDTO = null;
        LightningDetailClubDTO clubDTO = null;

        // 번개 루트 빌드 (존재할때만)

            RouteEntity route = temp.getRoute();
            log.info("번개 루트 : {}",route.getRouteId().toString());

                // 번개 루트 포인트 빌드 (존재할때만)
                List<RoutePointDTO> routePointDTOs = new ArrayList<>();
                for (RoutePointEntity entity : route.getRoutePoints()) {
                    RoutePointDTO build = RoutePointDTO.builder()
                            .route_point_id(String.valueOf(entity.getRoutePointId()))
                            .sequence(entity.getSequence())
                            .latitude(entity.getLatitude().floatValue())
                            .longitude(entity.getLongitude().floatValue())
                            .elevation(entity.getElevation().floatValue())
                            .build();
                    routePointDTOs.add(build);
                }
            // 번개 루트 Entity -> DTO (존재할때만)
            routeDTO = LightningDetailRouteDTO.builder()
                    .routeId(temp.getRoute().getRouteId())
                    .routeName(temp.getRoute().getRouteName())
                    .routeImgId(temp.getRoute().getRouteImgId())
                    .originalFilePath(temp.getRoute().getOriginalFilePath())
                    .fileName(temp.getRoute().getFileName())
                    .fileType(temp.getRoute().getFileType().toString())
                    .routePoints(routePointDTOs)
                    .build();

            log.info("DTO 빌드 후 루트이름 : {}", routeDTO.getRouteName());


        // 번개에 연결된 클럽정보 빌드 (존재할때만)
        log.info("클럽여부 : {}",temp.getIsClubOnly());
        if (temp.getIsClubOnly()) {
            Optional<ClubEntity> temp3 = clubRepository.findById(temp.getClubId());
            // 빌드
            clubDTO = LightningDetailClubDTO.builder()
                    .clubId(temp3.get().getClubId())
                    .clubName(temp3.get().getClubName())
                    .build();

            log.info("DTO 빌드 후 클럽이름 : {}", clubDTO.getClubName());
        }


        // 현재 참여자 수 조회
        Integer currentMemberCount = lightningUserRepository.countByLightning_LightningIdAndParticipantStatusInApprovedAndCompleted(temp.getLightningId());

        // 번개 참여자 빌드
        List<LightningDetailMemberDTO> memberDTOs = new ArrayList<>();
        log.info("번개 아이디 : {}", temp.getLightningId());
        List<LightningUserEntity> members = lightningUserRepository.findAllByLightning_LightningId(temp.getLightningId());

            for (LightningUserEntity entity : members) {
                log.info("멤버 리스트에서 한명씩 추출 : {}", entity.getUser().getUserId());
                // 유저별 디테일 정보 조회
                Long memberId = entity.getUser().getUserId();
                log.info("멤버의 아이디 : {}", memberId);
                Optional<UserDetailEntity> user = userDetailRepository.findByUserId(memberId);
                log.info("멤버의 디테일 Entity : {}", user.toString());

                UserDetailEntity member = user.get();

                log.info("멤버의 디테일 : {}", member.toString());
                //빌드
                LightningDetailMemberDTO build = LightningDetailMemberDTO.builder()
                        .lightningUserId(entity.getUser().getUserId())
                        .participantStatus(entity.getParticipantStatus().name())
                        .role(entity.getRole().name())
                        .memberNickname(member.getUserNickname())
                        .memberProfileImg(member.getUserProfileImg())
                        .build();
                memberDTOs.add(build);
            }
            log.info("멤버 빌드 완료");

            log.info("최종직전: {}", temp);


// 북마크 여부 기본값을 false로 선언
Boolean bookmarked = false;

// userEmail 이 null이 아닌 경우
if (userEmail != null) {
    Optional<UserEntity> userOpt = userRepository.findByEmail(userEmail);
    if (userOpt.isPresent()) {
        bookmarked = bookmarkRepository.existsByTargetIdAndUser_UserId(
            temp.getLightningId(), userOpt.get().getUserId());
    }
}

        // entity -> dto
        LightningDetailGetResponseDTO lightningDetailGetResponseDTO = LightningDetailGetResponseDTO.builder()
                .lightningId(temp.getLightningId())
                .title(temp.getTitle())
                .description(temp.getDescription())
                .eventDate(temp.getEventDate())
                .duration(temp.getDuration())
                .createdAt(temp.getCreatedAt())
                .updatedAt(temp.getUpdatedAt())
                .status(temp.getStatus().name())
                .capacity(temp.getCapacity())
                .currentMemberCount(currentMemberCount)
                .latitude(temp.getLatitude())
                .longitude(temp.getLongitude())
                .gender(temp.getGender().name())
                .level(temp.getLevel().name())
                .bikeType(temp.getBikeType().name())
                .region(temp.getRegion().name())
                .recruitType(temp.getRecruitType().name())
                .distance(temp.getDistance())
                .address(temp.getAddress())
                .creatorId(temp.getCreatorId())
                .creator(creatorDTO)
                .route(routeDTO)
                .isClubOnly(temp.getIsClubOnly())
                .club(clubDTO)
                .lightningUserId(temp.getLightningId())
                .member(memberDTOs)
                .lightningTag(tagNames)
                .bookmarked(bookmarked)
                .build();

        log.info("최종 DTO: {}", lightningDetailGetResponseDTO);

        return lightningDetailGetResponseDTO;
    }
}
