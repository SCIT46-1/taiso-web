package com.taiso.bike_api;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.taiso.bike_api.domain.ClubEntity;
import com.taiso.bike_api.domain.LightningEntity;
import com.taiso.bike_api.domain.LightningUserEntity;
import com.taiso.bike_api.domain.RouteEntity;
import com.taiso.bike_api.domain.UserDetailEntity;
import com.taiso.bike_api.domain.UserEntity;
import com.taiso.bike_api.repository.ClubRepository;
import com.taiso.bike_api.repository.LightningUserRepository;
import com.taiso.bike_api.repository.RouteRepository;
import com.taiso.bike_api.repository.UserDetailRepository;
import com.taiso.bike_api.repository.UserRepository;
import com.taiso.bike_api.repository.UserRoleRepository;
import com.taiso.bike_api.repository.UserStatusRepository;

import jakarta.transaction.Transactional;

@Component
public class InitLoader implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private UserRoleRepository userRoleRepository;
    
    @Autowired
    private UserStatusRepository userStatusRepository;
    
    @Autowired
    private UserDetailRepository userDetailRepository;
    
    @Autowired
    private LightningUserRepository lightningUserRepository;
    
    @Autowired
    private RouteRepository routeRepository;
    
    @Autowired
    private ClubRepository clubRepository;
    
    @Override
    @Transactional
    public void run(String... args) throws Exception {
            // 회원 및 회원 상세 데이터 생성
            UserEntity user1 = createUser("test@test.com", "asdf1234!");
            createUserDetail(user1, "무면허라이더", "처음뵙겠습니다.", 120, "여자", "초보자",
                            LocalDate.now(), "권혜연", "010-5529-7835", 158, 48);

            UserEntity user2 = createUser("test2@test.com", "asdf1234!");
            createUserDetail(user2, "수달", "자기소개를 입력해주세요.", 140, "남자", "초보자",
                            LocalDate.now(), "송종근", "010-1102-4567", 158, 48);
            // user2에 대해 추가 회원 상세 데이터 (예: 다른 닉네임)
            createUserDetail(user2, "Speed", "나는 열정적인 라이더입니다.", 120, "남자", "입문자",
                            LocalDate.now(), "김철수", "010-9876-5432", 199, 55);

            UserEntity user3 = createUser("test3@test.com", "asdf1234!");
            createUserDetail(user3, "따릉이폭주", "달립니다.", 121, "남자", "고수",
            LocalDate.now(), "최성현", "010-4321-1234", 200, 65);
            
            RouteEntity route = routeRepository.findById(1L).orElse(null);
            // 번개 이벤트 1: 참가형 예시
            LightningEntity lightning1 = createLightningEvent(
                            1L,
                            "예시 번개 타이틀",
                            "이 번개는 예시를 위한 설명입니다.",
                            LocalDateTime.now().plusDays(1),
                            120,
                            LightningEntity.LightningStatus.모집,
                            20,
                            new BigDecimal("37.5665"),
                            new BigDecimal("126.9780"),
                            LightningEntity.Gender.자유,
                            LightningEntity.Level.입문,
                            LightningEntity.RecruitType.참가형,
                            LightningEntity.BikeType.로드,
                            LightningEntity.Region.서울,
                            10L,
                            "서울특별시 중구",
                            false,
                            null,
                            route);
            lightningUserRepository.save(lightning1);

            //번개 이벤트 1에 대한 번개 참가 유저 생성
            LightningUserEntity creatorLightningUser = LightningUserEntity.builder()
                            .participantStatus(LightningUserEntity.ParticipantStatus.완료)
                            .role(LightningUserEntity.Role.번개생성자)
                            .lightning(lightning1)
                            .user(user1)
                            .build();
            lightningUserRepository.save(creatorLightningUser);

            // 클럽 예시 생성
            ClubEntity club = ClubEntity.builder()
                            .clubProfileImageId(null)
                            .clubName("잠수교폭주족")
                            .clubLeader(user1)
                            .clubShortDescription("지구 끝까지 달리자")
                            .clubDescription("활동 참여 분기 1회 이하는 강퇴 합니다.")
                            .maxUser(20)
                            .build();
            clubRepository.save(club);

            // 번개 이벤트 2: 수락형 예시
            // route 데이터 조회 (존재하지 않을 경우 null 처리)

            LightningEntity lightning2 = createLightningEvent(
                            1L,
                            "새로운 번개 이벤트",
                            "이 번개 이벤트는 새로운 예시를 위한 설명입니다.",
                            LocalDateTime.now().plusDays(2),
                            90,
                            LightningEntity.LightningStatus.모집,
                            15,
                            new BigDecimal("35.1796"),
                            new BigDecimal("129.0756"),
                            LightningEntity.Gender.자유,
                            LightningEntity.Level.초급,
                            LightningEntity.RecruitType.수락형,
                            LightningEntity.BikeType.로드,
                            LightningEntity.Region.서울,
                            15L,
                            "부산광역시 해운대구",
                            true,
                            1L,
                            route);
            lightningUserRepository.save(lightning2);

            // 번개 이벤트 2에 대한 번개 참가 유저 생성
            LightningUserEntity creatorLightningUser2 = LightningUserEntity.builder()
                            .participantStatus(LightningUserEntity.ParticipantStatus.완료)
                            .role(LightningUserEntity.Role.번개생성자)
                            .lightning(lightning2)
                            .user(user1)
                            .build();
            lightningUserRepository.save(creatorLightningUser2);

            LightningUserEntity participantLightningUser = LightningUserEntity.builder()
                            .participantStatus(LightningUserEntity.ParticipantStatus.신청대기)
                            .role(LightningUserEntity.Role.참여자)
                            .lightning(lightning2)
                            .user(user2)
                            .build();
            lightningUserRepository.save(participantLightningUser);

            // 번개 이벤트 3: 종료 상태 예시
            LightningEntity lightning3 = createLightningEvent(
                            1L,
                            "3번째 번개 이벤트",
                            "이 번개 이벤트는 3번째 예시 입니다.",
                            LocalDateTime.now().plusDays(3),
                            130,
                            LightningEntity.LightningStatus.종료,
                            15,
                            new BigDecimal("33.1226"),
                            new BigDecimal("133.3336"),
                            LightningEntity.Gender.자유,
                            LightningEntity.Level.중급,
                            LightningEntity.RecruitType.참가형,
                            LightningEntity.BikeType.로드,
                            LightningEntity.Region.서울,
                            15L,
                            "서울특별시 삼성역",
                            false,
                            null,
                            route);
            lightningUserRepository.save(lightning3);

            // 번개 이벤트 3에 대한 참가 유저 생성
            lightningUserRepository.save(LightningUserEntity.builder()
                            .participantStatus(LightningUserEntity.ParticipantStatus.완료)
                            .role(LightningUserEntity.Role.번개생성자)
                            .lightning(lightning3)
                            .user(user1)
                            .build());
            lightningUserRepository.save(LightningUserEntity.builder()
                            .participantStatus(LightningUserEntity.ParticipantStatus.완료)
                            .role(LightningUserEntity.Role.참여자)
                            .lightning(lightning3)
                            .user(user2)
                            .build());
            lightningUserRepository.save(LightningUserEntity.builder()
                            .participantStatus(LightningUserEntity.ParticipantStatus.완료)
                            .role(LightningUserEntity.Role.참여자)
                            .lightning(lightning3)
                            .user(user3)
                            .build());
                            
                                    //예시 번개 이벤트 생성
                                
                                        // 번개 이벤트 1: 참가형 예시
                                        LightningEntity lightning4 = createLightningEvent(
                                                        1L,
                                                        "예시 번개 타이틀",
                                                        "이 번개는 예시를 위한 설명입니다.",
                                                        LocalDateTime.now().plusDays(0),
                                                        120,
                                                        LightningEntity.LightningStatus.모집,
                                                        20,
                                                        new BigDecimal("37.5665"),
                                                        new BigDecimal("126.9780"),
                                                        LightningEntity.Gender.자유,
                                                        LightningEntity.Level.고급,
                                                        LightningEntity.RecruitType.참가형,
                                                        LightningEntity.BikeType.로드,
                                                        LightningEntity.Region.서울,
                                                        10L,
                                                        "서울특별시 중구",
                                                        false,
                                                        null,
                                                        route);
                                        lightningUserRepository.save(lightning4);
                            
                                        //번개 이벤트 1에 대한 번개 참가 유저 생성
                                        LightningUserEntity creatorLightningUser4 = LightningUserEntity.builder()
                                                        .participantStatus(LightningUserEntity.ParticipantStatus.완료)
                                                        .role(LightningUserEntity.Role.번개생성자)
                                                        .lightning(lightning4)
                                                        .user(user1)
                                                        .build();
                                        lightningUserRepository.save(creatorLightningUser4);




                                         // 번개 이벤트 2: 참가형 예시
                                        LightningEntity lightning5 = createLightningEvent(
                                                        1L,
                                                        "예시 번개 타이틀",
                                                        "이 번개는 예시를 위한 설명입니다.",
                                                        LocalDateTime.now().plusDays(0),
                                                        120,
                                                        LightningEntity.LightningStatus.모집,
                                                        20,
                                                        new BigDecimal("37.5665"),
                                                        new BigDecimal("126.9780"),
                                                        LightningEntity.Gender.남,
                                                        LightningEntity.Level.입문,
                                                        LightningEntity.RecruitType.참가형,
                                                        LightningEntity.BikeType.MTB,
                                                        LightningEntity.Region.전라,
                                                        10L,
                                                        "서울특별시 중구",
                                                        false,
                                                        null,
                                                        route);
                                        lightningUserRepository.save(lightning5);
                            
                                        //번개 이벤트 1에 대한 번개 참가 유저 생성
                                        LightningUserEntity creatorLightningUser5 = LightningUserEntity.builder()
                                                        .participantStatus(LightningUserEntity.ParticipantStatus.완료)
                                                        .role(LightningUserEntity.Role.번개생성자)
                                                        .lightning(lightning5)
                                                        .user(user1)
                                                        .build();
                                        lightningUserRepository.save(creatorLightningUser5);


                                         // 번개 이벤트 2: 참가형 예시
                                        LightningEntity lightning6 = createLightningEvent(
                                                        1L,
                                                        "예시 번개 타이틀",
                                                        "이 번개는 예시를 위한 설명입니다.",
                                                        LocalDateTime.now(),
                                                        120,
                                                        LightningEntity.LightningStatus.모집,
                                                        20,
                                                        new BigDecimal("37.5665"),
                                                        new BigDecimal("126.9780"),
                                                        LightningEntity.Gender.자유,
                                                        LightningEntity.Level.중급,
                                                        LightningEntity.RecruitType.참가형,
                                                        LightningEntity.BikeType.로드,
                                                        LightningEntity.Region.서울,
                                                        10L,
                                                        "서울특별시 중구",
                                                        false,
                                                        null,
                                                        route);
                                        lightningUserRepository.save(lightning6);
                            
                                        //번개 이벤트 1에 대한 번개 참가 유저 생성
                                        LightningUserEntity creatorLightningUser6 = LightningUserEntity.builder()
                                                        .participantStatus(LightningUserEntity.ParticipantStatus.완료)
                                                        .role(LightningUserEntity.Role.번개생성자)
                                                        .lightning(lightning6)
                                                        .user(user1)
                                                        .build();
                                        lightningUserRepository.save(creatorLightningUser6);
                                
                            
                            

    }                        
        




    private UserEntity createUser(String email, String password) {
        UserEntity user = UserEntity.builder()
                .email(email)
                .password(passwordEncoder.encode(password))
                .role(userRoleRepository.findByRoleName("USER").orElseThrow())
                .status(userStatusRepository.findByStatusName("ACTIVE").orElseThrow())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        return userRepository.saveAndFlush(user);
    }
    






    private void createUserDetail(UserEntity user, String nickname, String bio, int ftp, String gender, String level,
                    LocalDate birthDate, String fullName, String phoneNumber, int height, int weight) {
                                        
        UserDetailEntity detail = userDetailRepository.findByUserId(user.getUserId()).orElse(null);
        
        if (detail == null) {
            detail = UserDetailEntity.builder()
                    .userNickname(nickname)
                    .bio(bio)
                    .FTP(ftp)
                    .gender(UserDetailEntity.Gender.valueOf(gender))
                    .level(UserDetailEntity.Level.valueOf(level))
                    .birthDate(birthDate)
                    .fullName(fullName)
                    .phoneNumber(phoneNumber)
                    .height(height)
                    .weight(weight)
                    .user(user)
                    .build();
            userDetailRepository.save(detail);
        }
    }
    


    private LightningEntity createLightningEvent(Long creatorId, String title, String description,
                                                 LocalDateTime eventDate, int duration,
                                                 LightningEntity.LightningStatus status, int capacity,
                                                 BigDecimal latitude, BigDecimal longitude,
                                                 LightningEntity.Gender gender, LightningEntity.Level level,
                                                 LightningEntity.RecruitType recruitType, LightningEntity.BikeType bikeType,
                                                 LightningEntity.Region region, Long distance, String address,
                                                 boolean isClubOnly, Long clubId, RouteEntity route) {
        return LightningEntity.builder()
                .creatorId(creatorId)
                .title(title)
                .description(description)
                .eventDate(eventDate)
                .duration(duration)
                .status(status)
                .capacity(capacity)
                .latitude(latitude)
                .longitude(longitude)
                .gender(gender)
                .level(level)
                .recruitType(recruitType)
                .bikeType(bikeType)
                .region(region)
                .distance(distance)
                .address(address)
                .isClubOnly(isClubOnly)
                .clubId(clubId)
                .route(route)
                .build();
    }
}