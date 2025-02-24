package com.taiso.bike_api.repository;

import com.taiso.bike_api.domain.UserReviewEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserReviewRepository extends JpaRepository<UserReviewEntity, Long> {
    // 추가 쿼리가 필요하면 여기에 정의
}
