package com.taiso.bike_api.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.taiso.bike_api.domain.UserTagCategoryEntity;

public interface UserTagCategoryRepository extends JpaRepository<UserTagCategoryEntity, Long> {

    Optional<UserTagCategoryEntity> findByName(String tag);

    

}
