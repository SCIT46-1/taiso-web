package com.taiso.bike_api;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.taiso.bike_api.domain.ClubEntity;
import com.taiso.bike_api.domain.ClubMemberEntity;
import com.taiso.bike_api.domain.ClubMemberEntity.ParticipantStatus;
import com.taiso.bike_api.domain.ClubMemberEntity.Role;
import com.taiso.bike_api.domain.LightningEntity;
import com.taiso.bike_api.domain.LightningUserEntity;
import com.taiso.bike_api.domain.RouteEntity;
import com.taiso.bike_api.domain.UserDetailEntity;
import com.taiso.bike_api.domain.UserEntity;
import com.taiso.bike_api.repository.ClubMemberRepository;
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

    @Autowired
    private ClubMemberRepository clubMemberRepository;
    
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

        // 클럽 생성
        ClubEntity club1 = ClubEntity.builder()
                .clubProfileImageId(null)
                .clubName("잠수교폭주족")
                .clubLeader(user1)
                .clubShortDescription("지구 끝까지 달리자")
                .clubDescription("활동 참여 분기 1회 이하는 강퇴 합니다.")
                .maxUser(20)
                .build();
        clubRepository.save(club1);

        ClubEntity club2 = ClubEntity.builder()
                .clubProfileImageId(null)
                .clubName("2번 클럽")
                .clubLeader(user1)
                .clubShortDescription("적당히 자전거 타기")
                .clubDescription("마음껏 자유롭게 자전거 참여하기")
                .maxUser(2)
                .build();
        clubRepository.save(club2);

        ClubEntity club3 = ClubEntity.builder()
                .clubProfileImageId(null)
                .clubName("3번 클럽")
                .clubLeader(user1)
                .clubShortDescription("열심히 자전거 타자")
                .clubDescription("3번째 클럽 자전거 타기 설명")
                .maxUser(8)
                .build();
        clubRepository.save(club3);

        ClubEntity club4 = ClubEntity.builder()
                .clubProfileImageId(null)
                .clubName("4번 클럽")
                .clubLeader(user2)
                .clubShortDescription("열심히 자전거 타자")
                .clubDescription("3번째 클럽 자전거 타기 설명")
                .maxUser(8)
                .build();
        clubRepository.save(club4);
           
        // 클럽 멤버 생성
        ClubMemberEntity clubMember1 = ClubMemberEntity.builder()
                .user(user2)
                .club(club1)
                .role(Role.멤버)
                .participantStatus(ParticipantStatus.승인)
                .build();
        clubMemberRepository.save(clubMember1);
        
        ClubMemberEntity clubMember2user1 = ClubMemberEntity.builder()
                .user(user2)
                .club(club2)
                .role(Role.멤버)
                .participantStatus(ParticipantStatus.승인)
                .build();
        clubMemberRepository.save(clubMember2user1);

        ClubMemberEntity clubMember2user2 = ClubMemberEntity.builder()
                .user(user3)
                .club(club2)
                .role(Role.멤버)
                .participantStatus(ParticipantStatus.승인)
                .build();
        clubMemberRepository.save(clubMember2user2);

        ClubMemberEntity clubMember3user1 = ClubMemberEntity.builder()
                .user(user1)
                .club(club3)
                .role(Role.클럽장)
                .participantStatus(ParticipantStatus.승인)
                .build();
        clubMemberRepository.save(clubMember3user1);

        ClubMemberEntity clubMember3user2 = ClubMemberEntity.builder()
                .user(user2)
                .club(club3)
                .role(Role.멤버)
                .participantStatus(ParticipantStatus.신청대기)
                .build();
        clubMemberRepository.save(clubMember3user2);

        ClubMemberEntity clubMember3user3 = ClubMemberEntity.builder()
                .user(user3)
                .club(club3)
                .role(Role.멤버)
                .participantStatus(ParticipantStatus.신청대기)
                .build();
        clubMemberRepository.save(clubMember3user3);

        ClubMemberEntity clubMember4user1 = ClubMemberEntity.builder()
                .user(user2)
                .club(club4)
                .role(Role.클럽장)
                .participantStatus(ParticipantStatus.승인)
                .build();
        clubMemberRepository.save(clubMember4user1);

        ClubMemberEntity clubMember4user2 = ClubMemberEntity.builder()
                .user(user1)
                .club(club4)
                .role(Role.멤버)
                .participantStatus(ParticipantStatus.승인)
                .build();
        clubMemberRepository.save(clubMember4user2);
        
        // 번개 이벤트 생성
        
        // route 정보 조회 (번개 이벤트 중 club 연관 이벤트에 사용)
        RouteEntity route = routeRepository.findById(1L).orElse(null);



        // 번개 이벤트 1: 참가형 예시 (club 정보와 무관한 이벤트)
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
                LightningEntity.Level.초급,
                LightningEntity.RecruitType.참가형,
                LightningEntity.BikeType.로드,
                LightningEntity.Region.서울,
                10L,
                "서울특별시 중구",
                false,
                null,
                route
        );
        lightningUserRepository.save(lightning1);
        LightningUserEntity creatorLightningUser1 = LightningUserEntity.builder()
                .participantStatus(LightningUserEntity.ParticipantStatus.완료)
                .role(LightningUserEntity.Role.번개생성자)
                .lightning(lightning1)
                .user(user1)
                .build();
        lightningUserRepository.save(creatorLightningUser1);


        // 번개 이벤트 2: 수락형 예시 (club 이벤트)
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
                route
        );
        lightningUserRepository.save(lightning2);
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
                4L,
                route
        );
        lightningUserRepository.save(lightning3);
        LightningUserEntity creatorLightningUser3 = LightningUserEntity.builder()
                .participantStatus(LightningUserEntity.ParticipantStatus.완료)
                .role(LightningUserEntity.Role.번개생성자)
                .lightning(lightning3)
                .user(user1)
                .build();
        lightningUserRepository.save(creatorLightningUser3);
        LightningUserEntity participantLightningUser3_2 = LightningUserEntity.builder()
                .participantStatus(LightningUserEntity.ParticipantStatus.완료)
                .role(LightningUserEntity.Role.참여자)
                .lightning(lightning3)
                .user(user2)
                .build();
        lightningUserRepository.save(participantLightningUser3_2);
        LightningUserEntity participantLightningUser3_3 = LightningUserEntity.builder()
                .participantStatus(LightningUserEntity.ParticipantStatus.완료)
                .role(LightningUserEntity.Role.참여자)
                .lightning(lightning3)
                .user(user3)
                .build();
        lightningUserRepository.save(participantLightningUser3_3);
        
        // 추가 예시 번개 이벤트 생성 (feature/3.4-lightning)
        
        // 번개 이벤트 4
        LightningEntity lightning4 = createLightningEvent(
                1L,
                "[하남시]평일 라이딩 같이 달려요",
                "안녕하세요 황소탄왕자입니다.\n" +
                        "\n" +
                        "설날에 먹은 떡국을 소화  시키고자 소말머리 업힐 하러 갑니당^^\n" +
                        "금요일 눈예보에 일요일 공도위주로 출동합니다.\n" +
                        "소말머리 다운힐은 아주 천천히 부탁드립니다. ^^ (마장호수쪽 안갑니다.)\n" +
                        " \n" +
                        "몸뚱이가 두꺼워져서 [빠른 초급 모드]로 진행됩니다. ^ ^ (34~39km/h)\n" +
                        "★★ 저는 후미를 챙겨가야 해서 ㅎㅎㅎ \n" +
                        "빠르신 분들은 꼭 코스 파일 넣어 와 주시기 바랍니다.^^ ★★\n" +
                        " \n" +
                        "- 보급은 1번 하려합니다. 커피이십센치 광탄점\n" +
                        "- 보급비는 1번째 보급지에서 1/n 하겠습니다. ^^ (추워서 실내 보급입니당.)\n" +
                        " - 2인 이상 진행합니다. \n" +
                        " - 까페벙이라 커피마셔서 보급이 부실할지 모르니 개인 보급 챙겨오셔용^^\n" +
                        "\n" +
                        "☕ 보급지1: 커피이십센치 광탄점 43km 지점\n" +
                        "링크는 https://place.map.kakao.com/1273289994",
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
                4L,
                route
        );
        lightningUserRepository.save(lightning4);
        LightningUserEntity creatorLightningUser4 = LightningUserEntity.builder()
                .participantStatus(LightningUserEntity.ParticipantStatus.완료)
                .role(LightningUserEntity.Role.번개생성자)
                .lightning(lightning4)
                .user(user1)
                .build();
        lightningUserRepository.save(creatorLightningUser4);

        // 번개 이벤트 5
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
                route
        );
        lightningUserRepository.save(lightning5);
        LightningUserEntity creatorLightningUser5 = LightningUserEntity.builder()
                .participantStatus(LightningUserEntity.ParticipantStatus.완료)
                .role(LightningUserEntity.Role.번개생성자)
                .lightning(lightning5)
                .user(user1)
                .build();
        lightningUserRepository.save(creatorLightningUser5);

        // 번개 이벤트 6
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
                route
        );
        lightningUserRepository.save(lightning6);
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