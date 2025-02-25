package com.taiso.bike_api.domain;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;


@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@ToString
@Table(name = "user_detail")
public class UserDetailEntity {

    @Id
    @Column(name = "user_id")
    private Long userId;

    @OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @MapsId
    @JoinColumn(name = "user_id")
    private UserEntity user;

    @Column(name = "user_nickname", length = 50, unique = true)
    private String userNickname;

    // 이미지 번호는 별도의 AUTO_INCREMENT 없이 기본값 null로 관리
    @Column(name = "user_profile_img")
    private String userProfileImg;

    @Column(name = "user_background_img")
    private String userBackgroundImg;


    @Column(name = "full_name", length = 500)
    private String fullName;

    @Column(name = "phone_number", length = 50)
    private String phoneNumber;

    @Column(name = "birth_date")
    private LocalDateTime birthDate;

    @Column(name = "vio", length = 500)
    private String vio;

    @Enumerated(EnumType.STRING)
    @Column(name = "gender", length = 10)
    private Gender gender;

    @Enumerated(EnumType.STRING)
    @Column(name = "level", length = 20)
    private Level level;

    @Column(name = "FTP")
    private Integer FTP;

    @Column(name = "height")
    private Integer height;

    @Column(name = "weight")
    private Integer weight;

    @Column(name = "age")
    private Integer age;

    @ManyToMany(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(name = "user_tag",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "tag_id"))
    @Builder.Default
    private Set<UserTagCategoryEntity> tags = new HashSet<>();

    public enum Gender {
        남자, 여자, 그외
    }

    public enum Level {
        무경력, 초보자, 입문자, 중수, 고수
    }
}