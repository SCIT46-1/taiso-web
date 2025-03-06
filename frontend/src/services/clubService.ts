import { del, get, patch, post } from "../api/request";

export interface ClubListResponse {
  clubId: number;
  clubLeaderId: number;
  clubLeaderName: string;
  clubLeaderProfileImageId: string;
  clubName: string;
  clubProfileImageId: string;
  clubShortDescription: string;
  currentScale: number;
  maxScale: number;
  tags: string[];
}

export interface ClubDetailResponse {
  clubId: number;
  clubProfileImageId: string | null;
  clubName: string;
  clubLeader: {
    leaderId: number;
    leaderName: string;
  };
  clubDescription: string;
  createdAt: string;
  maxUser: number;
  currentScale: number;
  users: [
    {
      userId: number;
      userNickname: string;
      userProfileImage: string | null;
      bio: string;
    }
  ];
  tags: string[];
}

export interface ClubCreateRequest {
  clubName: string;
  clubShortDescription: string;
  clubDescription: string;
  maxUser: number;
  tags: string[];
}

export interface ClubApplyResponse {
  clubMemberId: number;
}

const getClubList = async (): Promise<ClubListResponse[]> => {
  return await get(`/clubs`);
};

const getClubDetail = async (clubId: number): Promise<ClubDetailResponse> => {
  return await get(`/clubs/${clubId}`);
};

const createClub = async (
  clubData: ClubCreateRequest
): Promise<ClubDetailResponse> => {
  return await post(`/clubs`, clubData);
};

const createClubWithImage = async (
  clubData: ClubCreateRequest,
  clubProfileImage: File
): Promise<ClubDetailResponse> => {
  // FormData 객체 생성
  const formData = new FormData();

  // FormData에 JSON 데이터와 이미지 파일 추가
  formData.append(
    "clubData",
    new Blob([JSON.stringify(clubData)], { type: "application/json" })
  );
  formData.append("clubProfileImage", clubProfileImage);

  // axios는 FormData 객체를 자동으로 처리
  return await post(`/clubs`, formData);
};

//클럽 가입 신청
const applyClub = async (clubId: number): Promise<ClubApplyResponse> => {
  return await post(`/clubs/${clubId}/members`);
};

//클럽 가입 거절
const rejectClubMember = async (
  clubId: number,
  userId: number
): Promise<ClubApplyResponse> => {
  return await del(`/clubs/${clubId}/members/${userId}`);
};

//클럽 가입 수락
const acceptClubMember = async (
  clubId: number,
  userId: number
): Promise<ClubApplyResponse> => {
  return await patch(`/clubs/${clubId}/members/${userId}`);
};

//클럽 탈퇴
const leaveClub = async (clubId: number): Promise<ClubApplyResponse> => {
  return await del(`/clubs/${clubId}/members`);
};

export default {
  getClubList,
  getClubDetail,
  createClub,
  createClubWithImage,
  applyClub,
  rejectClubMember,
  acceptClubMember,
  leaveClub,
};
