package com.taiso.bike_api;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.taiso.bike_api.domain.LightningEntity;
import com.taiso.bike_api.domain.LightningUserEntity;
import com.taiso.bike_api.domain.UserDetailEntity;
import com.taiso.bike_api.domain.UserEntity;
import com.taiso.bike_api.repository.LightningUserRepository;
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


    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // // role 추가
        // UserRoleEntity role = UserRoleEntity.builder()
        //     .roleName("USER")
        //     .createdAt(LocalDateTime.now())
        //     .updatedAt(LocalDateTime.now())
        //     .build();
        // userRoleRepository.save(role);

        // // status 추가
        // UserStatusEntity status = UserStatusEntity.builder()
        //     .statusName("ACTIVE")
        //     .createdAt(LocalDateTime.now())
        //     .updatedAt(LocalDateTime.now())
        //     .build();
        // userStatusRepository.save(status);


        // 테스트 아이디 추가
        UserEntity user = UserEntity.builder()
                .email("test@test.com")
                .password(passwordEncoder.encode("asdf1234!"))
                .role(userRoleRepository.findByRoleName("USER").get())
                .status(userStatusRepository.findByStatusName("ACTIVE").get())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        // 사용자 저장 후 ID가 할당됨
        userRepository.saveAndFlush(user);

        // UserDetailEntity 저장
        UserDetailEntity userDetail = UserDetailEntity.builder()
                .userNickname("무면허라이더")
                .bio("처음뵙겠습니다.")
                .FTP(134)
                .gender(UserDetailEntity.Gender.valueOf("여자"))
                .level(UserDetailEntity.Level.valueOf("초보자"))
                .birthDate(LocalDateTime.now())
                .fullName("권혜연")
                .phoneNumber("010-5529-7835")
                .height(158)
                .weight(48)
                .FTP(120)
                .user(user)  // user 객체를 연결
                .build();

        // userDetail 저장
        userDetailRepository.save(userDetail);
        
        // lightningEntity 참가형 예시 생성
        LightningEntity lightningEntity = LightningEntity.builder()
                .creatorId(1L)
                .title("예시 번개 타이틀")
                .description("이 번개는 예시를 위한 설명입니다.")
                .eventDate(LocalDateTime.now().plusDays(1)) // 내일 이벤트
                .duration(120) // 120분
                .status(LightningEntity.LightningStatus.모집)
                .capacity(20)
                .latitude(new BigDecimal("37.5665"))
                .longitude(new BigDecimal("126.9780"))
                .gender(LightningEntity.Gender.자유)
                .level(LightningEntity.Level.초보)
                .recruitType(LightningEntity.RecruitType.참가형)
                .bikeType(LightningEntity.BikeType.로드)
                .region(LightningEntity.Region.서울)
                .distance(10L)
                .address("서울특별시 중구")
                .isClubOnly(false)
                // clubId 및 routeId가 필요한 경우, 적절한 값을 넣어주세요.
                .build();
        
        lightningUserRepository.save(lightningEntity);
        
     // lightningEntity 수락형 예시 생성
        LightningEntity lightningEntity2 = LightningEntity.builder()
        	    .creatorId(1L)
        	    .title("새로운 번개 이벤트")
        	    .description("이 번개 이벤트는 새로운 예시를 위한 설명입니다.")
        	    .eventDate(LocalDateTime.now().plusDays(2)) // 모레 이벤트
        	    .duration(90) // 90분
        	    .status(LightningEntity.LightningStatus.모집)
        	    .capacity(15)
        	    .latitude(new BigDecimal("35.1796"))
        	    .longitude(new BigDecimal("129.0756"))
        	    .gender(LightningEntity.Gender.자유)
        	    .level(LightningEntity.Level.초보)
        	    .recruitType(LightningEntity.RecruitType.수락형)
        	    .bikeType(LightningEntity.BikeType.로드)
        	    .region(LightningEntity.Region.서울)
        	    .distance(15L)
        	    .address("부산광역시 해운대구")
        	    .isClubOnly(true)
        	    // clubId 및 routeId가 필요한 경우, 적절한 값을 넣어주세요.
        	    .build();
        
        lightningUserRepository.save(lightningEntity2);
        
     // 테스트 아이디 추가 (번개 참가용)
        UserEntity user2 = UserEntity.builder()
                .email("test2@test.com")
                .password(passwordEncoder.encode("asdf1234!"))
                .role(userRoleRepository.findByRoleName("USER").get())
                .status(userStatusRepository.findByStatusName("ACTIVE").get())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        // 사용자 저장 후 ID가 할당됨
        userRepository.saveAndFlush(user2);
        
        
     // 이미 생성된 번개 이벤트 lightningEntity를 활용하여 신청대기 상태의 번개 참가 유저 생성
        LightningUserEntity lightningUserEntity1 = LightningUserEntity.builder()
                .participantStatus(LightningUserEntity.ParticipantStatus.완료)  // 신청대기 상태 설정
                .role(LightningUserEntity.Role.번개생성자)                            // 참여자로 설정
                .lightning(lightningEntity2)                                     // 해당 번개 이벤트 할당
                .user(user)                                                    // user1 할당
                .build();        

     // 번개 참가 유저 저장 
     lightningUserRepository.save(lightningUserEntity1);
     
     
     // 번개 참여 유저 아이디 이미 저장된 user2를 활용하여 신청대기 상태의 LightningUserEntity 생성
        LightningUserEntity lightningUserEntity2 = LightningUserEntity.builder()
                .participantStatus(LightningUserEntity.ParticipantStatus.신청대기) // 신청대기 상태 지정
                .role(LightningUserEntity.Role.참여자)                           // 참여자로 지정
                .lightning(lightningEntity2)                                    // 앞서 생성한 lightningEntity2 사용
                .user(user2)                                                    // 저장한 user2 할당
                .build();

        // 데이터베이스에 저장
        lightningUserRepository.save(lightningUserEntity2);
    }
}
