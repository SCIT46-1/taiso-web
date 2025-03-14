import { post, get, patch, del } from "../api/request";

export interface LightningGetRequest {
  gender: string;
  level: string;
  bikeType: string;
  region: string;
  tags: string[];
}

// ResponseComponent 타입 정의
export interface Lightning {
  lightningId: number;
  creatorId: number;
  title: string;
  eventDate: string;
  duration: number;
  createdAt: string;
  status: string;
  capacity: number;
  gender: string;
  level: string;
  bikeType: string;
  tags: string[];
  address: string;
  routeImgId: string;
  currentParticipants: number;
  bookmarked: boolean;
}

// LightningGetResponse 타입 정의
export interface LightningListResponse {
  content: Lightning[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  last: boolean;
}

export interface LightningPostRequest {
  title: string;
  description: string;
  eventDate: string;
  duration: number;
  capacity: number;
  latitude: number;
  longitude: number;
  status: string;
  gender: string;
  level: string;
  recruitType: string;
  bikeType: string;
  region: string;
  distance: number;
  routeId: number;
  address: string;
  isClubOnly: boolean;
  clubId: number | null;
  tags: string[];
}

export interface LightningPostResponse {
  lightningId: number;
}

export interface LightningDetailGetResponse {
  currentMemberCount: number;
  address: string;
  bikeType: string;
  capacity: number;
  club: string | null;
  createdAt: string;
  creator: Creator;
  creatorNickname: string;
  creatorProfileImg: string | null;
  userId: number;
  creatorId: number;
  description: string;
  distance: number;
  duration: number;
  eventDate: string;
  gender: string;
  isClubOnly: boolean;
  latitude: number;
  level: string;
  lightningId: number;
  lightningTag: any[]; // Adjust type as needed, e.g. string[] if applicable
  lightningUserId: number;
  longitude: number;
  member: Member[];
  recruitType: string;
  region: string;
  route: Route;
  status: string;
  title: string;
  updatedAt: string;
}

interface Creator {
  userId: number;
  creatorNickname: string;
  creatorProfileImg: string | null;
}

export interface Member {
  lightningUserId: number;
  memberNickname: string;
  memberProfileImg: string | null;
  participantStatus: string;
  role: string;
}

interface RoutePoint {
  route_point_id: string;
  sequence: number;
  latitude: number;
  longitude: number;
  elevation: number;
}

interface Route {
  routeId: number;
  routeName: string;
  fileName: string;
  fileType: string;
  originalFilePath: string;
  routeImgId: string;
  routePoints: RoutePoint[];
}

export interface UserReviewData {
  isReviewed: boolean;
  lightningUserDTO: {
    lightning: number;
    role: string;
    participantStatus: string;
  };
  reviewId: number | null;
  reviewed: number;
  reviewer: number;
  userDetailDTO: {
    userId: number;
    reviewedNickname: string;
    reviewedProfileImg: string | null;
  };
}

export interface CompletedLightningResponse {
  lightningId: number;
  eventDate: string;
  duration: number;
  latitude: number;
  longitude: number;
  capacity: number;
  currentParticipants: number;
  routeTitle: string;
  joinDate: string;
}

const createLightning = async (
  payload: LightningPostRequest
): Promise<LightningPostResponse> => {
  return await post("/lightnings", payload);
};

const getLightningList = async (
  page: number,
  size: number,
  sort: string,
  gender: string,
  bikeType: string,
  level: string,
  region: string,
  tags: string[],
  selectedDate: string,
  clubId?: number
): Promise<LightningListResponse> => {
  let url = `/lightnings?page=${page}&size=${size}&sort=${sort}&gender=${gender}&bikeType=${bikeType}&level=${level}&region=${region}&tags=${tags}&date=${selectedDate}`;

  if (clubId) {
    url += `&clubId=${clubId}`;
  }

  return await get(url);
};

const getLightningDetail = async (
  lightningId: number
): Promise<LightningDetailGetResponse> => {
  return await get(`/lightnings/${lightningId}`);
};

// 번개 참가 및 참가 신청
const joinLightning = async (lightningId: number): Promise<void> => {
  return await post(`/lightnings/${lightningId}/participants`);
};

// 번개 참가 신청 취소
const cancelLightning = async (lightningId: number): Promise<void> => {
  return await patch(`/lightnings/${lightningId}/participants`);
};

// 번개 참가 신청 수락
const acceptLightning = async (
  lightningId: number,
  userId: number
): Promise<void> => {
  return await patch(`/lightnings/${lightningId}/join-requests/${userId}`);
};

// 번개 참가 신청 거절
const rejectLightning = async (
  lightningId: number,
  userId: number
): Promise<void> => {
  return await patch(`/lightnings/${lightningId}/join-rejection/${userId}`);
};

// 번개 나가기
const leaveLightning = async (lightningId: number): Promise<void> => {
  return await patch(`/lightnings/${lightningId}/exit`);
};

// 번개 마감
const closeLightning = async (lightningId: number): Promise<void> => {
  return await patch(`/lightnings/${lightningId}/close`);
};

// 번개 종료
const endLightning = async (lightningId: number): Promise<void> => {
  return await patch(`/lightnings/${lightningId}/end`);
};

//번개 리뷰 정보 조회
const getLightningReview = async (
  lightningId: number
): Promise<UserReviewData[]> => {
  return await get(`/lightnings/${lightningId}/reviews`);
};

const submitUserReview = async (
  lightningId: number,
  userId: number,
  reviewData: { reviewContent: string; reviewTag: string }
): Promise<void> => {
  return await post(
    `/lightnings/${lightningId}/reviews?userId=${userId}`,
    reviewData
  );
};

//리뷰 삭제
const deleteUserReview = async (
  lightningId: number,
  userId: number
): Promise<void> => {
  return await del(`/lightnings/${lightningId}/reviews?userId=${userId}`);
};

// 번개 완료 조회
const getCompletedLightnings = async (
  lightningId: number
): Promise<CompletedLightningResponse> => {
  return await get(`/lightnings/${lightningId}/complete`);
};

//메인 페이지 번개 조회
const getMainLightnings = async (): Promise<LightningListResponse> => {
  return await get(`/lightnings/main`);
};

export default {
  createLightning,
  getLightningList,
  getLightningDetail,
  joinLightning,
  cancelLightning,
  leaveLightning,
  acceptLightning,
  rejectLightning,
  closeLightning,
  endLightning,
  getLightningReview,
  submitUserReview,
  deleteUserReview,
  getCompletedLightnings,
  getMainLightnings,
};
