package com.taiso.bike_api.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import com.taiso.bike_api.domain.BookmarkEntity;
import com.taiso.bike_api.domain.BookmarkEntity.BookmarkType;
import com.taiso.bike_api.domain.ClubMemberEntity.ParticipantStatus;
import com.taiso.bike_api.domain.ClubEntity;
import com.taiso.bike_api.domain.UserEntity;
import com.taiso.bike_api.dto.BookmarkClubsGetResponseDTO;
import com.taiso.bike_api.repository.BookmarkRepository;
import com.taiso.bike_api.repository.ClubRepository;
import com.taiso.bike_api.repository.UserRepository;

@Service
public class BookmarkClubService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookmarkRepository bookmarkRepository;

    @Autowired
    private ClubRepository clubRepository;

    public List<BookmarkClubsGetResponseDTO> getBookmarkClubs(Authentication authentication) {

        // 사용자 조회
        UserEntity user = userRepository.findByEmail(authentication.getName()).get();

        // 사용자가 북마크한 클럽리스트 조회
        List<BookmarkEntity> bookmarkList = bookmarkRepository.findAllByUserAndTargetType(user, BookmarkType.CLUB);

        // 북마크한 클럽상세리스트 조회
        List<ClubEntity> clubList = clubRepository.findAllByClubIdIn(bookmarkList.stream().map(bookmark -> bookmark.getTargetId()).collect(Collectors.toList()));

        // responseDTO 빌드
        return clubList.stream().map(club -> BookmarkClubsGetResponseDTO.builder()
                                                        .clubId(club.getClubId())
                                                        .clubProfileImageId(club.getClubProfileImageId())
                                                        .clubName(club.getClubName())
                                                        .clubLeaderId(club.getClubLeader().getUserId())
                                                        .clubLeaderName(club.getClubLeader().getUserDetail().getUserNickname())
                                                        .clubLeaderProfileImageId(club.getClubLeader().getUserDetail().getUserProfileImg())
                                                        .clubShortDescription(club.getClubShortDescription())
                                                        .maxScale(club.getMaxUser())
                                                        .currentScale(club.getUsers().stream().filter(member -> member.getParticipantStatus() == ParticipantStatus.완료 || member.getParticipantStatus() == ParticipantStatus.승인).collect(Collectors.toList()).size())
                                                        .tags(club.getTags().stream().map(tag -> tag.getName()).collect(Collectors.toSet()))
                                                        .build())
                                                        .collect(Collectors.toList());
    }
    
}
