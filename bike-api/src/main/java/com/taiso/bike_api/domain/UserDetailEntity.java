package com.taiso.bike_api.domain;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "user_detail")
public class UserDetailEntity {
    /**
     * 유저 상세 ID
     */
    @Id
    @Column(name = "user_id")
    private Long userId;

    /**
     * 유저 엔티티
     */
    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "user_id")
    private UserEntity user;

    /**
     * 유저 닉네임
     */
    @Column(name = "user_nickname", length = 50, unique = true)
    private String userNickname;

    /**
     * 유저 프로필 이미지
     */
    @Column(name = "user_profile_img")
    private Long userProfileImg = 0L;

    /**
     * 유저 배경 이미지
     */
    @Column(name = "user_background_img")
    private Long userBackgroundImg = 0L;

    /**
     * 유저 이름
     */
    @Column(name = "full_name", length = 500)
    private String fullName;

    /**
     * 유저 전화번호
     */
    @Column(name = "phone_number", length = 50)
    private String phoneNumber;

    /**
     * 유저 생년월일
     */
    @Column(name = "birth_date")
    private LocalDateTime birthDate;

    /**
     * 유저 소개
     */
    @Column(name = "bio", length = 500)
    private String bio;

    /**
     * 유저 성별
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "gender", length = 10)
    private Gender gender;

    /**
     * 유저 레벨
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "level", length = 20)
    private Level level;

    // // SET 타입 컬럼: H2의 MySQL 모드 사용 시 native SET 자료형 지정
    // @Column(name = "activity_time", columnDefinition = "SET('morning','afternoon','evening')")
    // private String activityTime;

    // @Column(name = "activity_day", columnDefinition = "SET('Mon','Tue','Wed','Thu','Fri','Sat','Sun')")
    // private String activityDay;

    // @Column(name = "activity_location", columnDefinition = "SET('서울','경기','대구','강원')")
    // private String activityLocation;

    // @Column(name = "bike_type", columnDefinition = "SET('로드','따릉이','하이브리드','자유')")
    // private String bikeType;

    @Column(name = "FTP")
    private Integer FTP;

    @Column(name = "height")
    private Integer height;

    @Column(name = "weight")
    private Integer weight;

    //빌더
    public static UserDetailEntityBuilder builder() {
        return new UserDetailEntityBuilder();
    }
    //enum 타입 추가
    enum Gender {
        남자,
        여자,
        그외;
    }
    
    enum Level {
        무경력,
        초보자,
        입문자,
        중수,
        고수;
    }
}
    