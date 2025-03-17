import { del, get, patch, post } from "../api/request";

export interface ClubListResponse {
  content: {
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
    bookmarked: boolean;
  }[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface IClubList {
  bookmarked: boolean;
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
  clubShortDescription: string;
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
      participantStatus: string;
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

export interface ClubBoardListResponse {
  content: {
    postId: number;
    postWriter: number;
    writerNickname: string;
    writerProfileImg: string | null;
    postTitle: string;
    postContent: string;
    createdAt: string;
    updatedAt: string;
    isNotice: boolean;
    canDelete: boolean;
    canEdit: boolean;
  }[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface ClubBoardDetailResponse {
  postId: number;
  postWriter: number;
  writerNickname: string;
  writerProfileImg: string | null;
  postTitle: string;
  postContent: string;
  createdAt: string;
  updatedAt: string;
  isNotice: boolean;
  canDelete: boolean;
  canEdit: boolean;
}

export interface ClubDetailGetResponseUserDTO {
  userId: number;
  userNickname: string;
  userProfileImage: string | null;
  bio: string;
  participantStatus: string;
}

export interface ClubBoardPostRequest {
  postTitle: string;
  postContent: string;
  isNotice: boolean;
}

export interface ClubLightningListResponse {
  content: {
    lightningId: number;
    creatorId: number;
    title: string;
    eventDate: string;
    duration: number;
    createdAt: string;
    status: string;
    capacity: number;
    currentParticipants: number;
    gender: string;
    level: string;
    bikeType: string;
    tags: [];
    address: string;
    routeImgId: string;
    bookmarked: boolean;
  }[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

const getClubList = async (page = 0, size = 5): Promise<ClubListResponse> => {
  return await get(`/clubs?page=${page}&size=${size}`);
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

//클럽 게시글 관련 API

//클럽 게시글 리스트 조회
const getClubBoardList = async (
  clubId: number,
  page: number,
  size: number
): Promise<ClubBoardListResponse> => {
  return await get(`/clubs/${clubId}/boards?page=${page}&size=${size}`);
};

//클럽 게시글 상세 조회
const getClubBoardDetail = async (
  clubId: number,
  boardId: number
): Promise<ClubBoardDetailResponse> => {
  return await get(`/clubs/${clubId}/boards/${boardId}`);
};

//클럽 게시글 작성
const createClubBoard = async (
  clubId: number,
  boardData: ClubBoardPostRequest
): Promise<ClubBoardDetailResponse> => {
  return await post(`/clubs/${clubId}/boards`, boardData);
};

//클럽 게시글 수정
const updateClubBoard = async (
  clubId: number,
  boardId: number,
  boardData: ClubBoardPostRequest
): Promise<ClubBoardDetailResponse> => {
  return await patch(`/clubs/${clubId}/boards/${boardId}`, boardData);
};

//클럽 게시글 삭제
const deleteClubBoard = async (
  clubId: number,
  boardId: number
): Promise<void> => {
  return await del(`/clubs/${clubId}/boards/${boardId}`);
};

//클럽 전용 번개 조회
const getClubLightningList = async (
  clubId: number,
  page: number,
  size: number
): Promise<ClubLightningListResponse> => {
  return await get(`/lightnings/clubs/${clubId}?page=${page}&size=${size}`);
};

//내 클럽 조회
const getMyClub = async (): Promise<ClubListResponse> => {
  return await get(`/clubs/me`);
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
  getClubBoardList,
  getClubBoardDetail,
  createClubBoard,
  updateClubBoard,
  deleteClubBoard,
  getMyClub,
  getClubLightningList,
};
