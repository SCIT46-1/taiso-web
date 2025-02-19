package com.taiso.bike_api.repository;

import com.taiso.bike_api.domain.LightningTagCategoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LightningTagCategoryRepository extends JpaRepository<LightningTagCategoryEntity, Long> {
}


// 클럽 생성 시 요청된 태그 ID에 해당하는 태그 엔티티를 조회하기 위한 Repository입니다.
// (클럽 엔티티의 tags 필드는 LightningTagCategoryEntity와 Many-to-Many 관계로 매핑되어 있습니다.)