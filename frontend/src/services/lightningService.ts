import { post, get, patch } from "../api/request";

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
  selectedDate: string
): Promise<LightningListResponse> => {
  return await get(
    `/lightnings?page=${page}&size=${size}&sort=${sort}&gender=${gender}&bikeType=${bikeType}&level=${level}&region=${region}&tags=${tags}&date=${selectedDate}`
  );
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

export default {
  createLightning,
  getLightningList,
  getLightningDetail,
  joinLightning,
  cancelLightning,
  leaveLightning,
  acceptLightning,
  rejectLightning,
};
