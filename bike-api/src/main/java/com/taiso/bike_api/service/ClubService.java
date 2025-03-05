package com.taiso.bike_api.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.GetMapping;

import com.taiso.bike_api.domain.ClubEntity;
import com.taiso.bike_api.dto.ClubDetailGetResponseDTO;
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

}
