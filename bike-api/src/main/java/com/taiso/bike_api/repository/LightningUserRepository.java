package com.taiso.bike_api.repository;

import com.taiso.bike_api.domain.LightningUserEntity;
import com.taiso.bike_api.domain.UserEntity;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LightningUserRepository extends JpaRepository<LightningUserEntity, Long> {
    List<LightningUserEntity> findByUser(UserEntity user);
}
