package com.taiso.bike_api.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.taiso.bike_api.domain.UserDetailEntity;
import com.taiso.bike_api.domain.UserEntity;

public interface UserDetailRepository extends JpaRepository<UserDetailEntity, Long> {

    Optional<UserDetailEntity> findByUser(UserEntity user);

    Optional<UserDetailEntity> findByUserId(Long userId);

    Optional<UserDetailEntity> findByUserEmail(String email);

    // userIds 리스트에 포함된 사용자 정보를 한 번에 조회
    List<UserDetailEntity> findByUserIdIn(List<Long> userIds);
}
