package com.taiso.bike_api.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.taiso.bike_api.domain.ClubEntity;
import com.taiso.bike_api.dto.ClubDetailGetResponseDTO;
import com.taiso.bike_api.dto.ClubsGetResponseDTO;
import com.taiso.bike_api.exception.ClubNotFoundException;
import com.taiso.bike_api.repository.ClubRepository;

@Service
public class ClubService {

    @Autowired
    private ClubRepository clubRepository;
    
    public ClubDetailGetResponseDTO getClubDetail(Long clubId) {

        // 클럽 존재여부 확인
        ClubEntity club = clubRepository.findById(clubId)
            .orElseThrow(() -> new ClubNotFoundException("클럽이 존재하지 않습니다."));

        // responseDTO 빌드
        return ClubDetailGetResponseDTO.toDTO(club);
        
    }

    public List<ClubsGetResponseDTO> getClubs() {
        // 클럽 리스트 조회
        List<ClubEntity> clubs = clubRepository.findAll();

        // responseDTO 리스트 빌드
        return clubs.stream().map(ClubsGetResponseDTO::toDTO).toList();
    }

}
