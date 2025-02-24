package com.taiso.bike_api.repository;

import com.taiso.bike_api.domain.UserReviewEntity;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserReviewRepository extends JpaRepository<UserReviewEntity, Long> {
    List<UserReviewEntity> findByReviewed_UserIdAndLightning_LightningId(Long reviewedUserId, Long lightningId);
    Optional<UserReviewEntity> findByLightning_LightningIdAndReviewer_UserIdAndReviewed_UserId(Long lightningId, Long reviewerId, Long reviewedId);
}
