import { get, patch, post } from "../api/request";

export interface UserDetailGetResponse {
  userId: number;
  userNickname: string;
  userProfileImg: string;
  userBackgroundImg: string;
  fullName: string;
  phoneNumber: string;
  birthDate: string;
  bio: string;
  gender: string;
  level: string;
  FTP: number;
  height: number;
  weight: number;
  tags: string[];
}

export interface UserDetailPatchRequest {
  userNickname: string;
  fullName: string;
  phoneNumber: string;
  birthDate: string;
  gender: string;
  level: string;
  height: number;
  weight: number;
  ftp: number;
}

export interface UserDetailPostRequest {
  userNickname: string;
  gender: string;
  birthDate: string;
  phoneNumber: string;
  fullName: string;
  bio: string;
  activityTime: string[];
  activityDay: string[];
  activityLocation: string[];
  bikeType: string[];
  level: string;
  FTP: number;
  height: number;
  weight: number;
  tags: string[];
}

export interface UserDetailResponse {
  userId: number;
  userNickname: string;

  fullName: string;
  phoneNumber: string;
  birthDate: string;
  bio: string;
  gender: string;
  level: string;
  height: number;
  weight: number;
  tags: string[];
  ftp: number;
}

export interface MyLightningResponse {
  lightning: {
    lightningId: number;
    title: string;
    eventDate: string; // ISO 8601 date string
    creatorId: number;
    status: string;
    duration: number;
    capacity: number;
    address: string | null;
  };
  users: {
    userId: number;
    userNickname: string;
    userProfileImg: string | null;
    bio: string | null;
  }[];
  tags: {
    tags: string[];
  };
  status: string;
}

export interface UserPageDetailRequest {
  userId: number;
  userNickname: string;
  bio: string;
  profileImg: string;
  backgroundImg: string;
  level: string;
  gender: string;
  tags: string[];
}

export interface UserPageDetailResponse {
  userId: number;
  userNickname: string;
  bio: string;
  userProfileImg: string;
  userBackgroundImg: string;
  level: string;
  gender: string;
  tags: string[];
}

export interface UserAuthInfoResponse {
  userEmail: string;
}

//유저 페이지 디테일 조회
const getUserPageDetail = async (
  userId: number
): Promise<UserPageDetailResponse> => {
  return await get(`/users/${userId}`);
};

//유저 페이지 디테일 수정
const patchUserPageDetail = async (
  payload: UserPageDetailRequest
): Promise<void> => {
  return await patch(`/users/me/details`, payload);
};

//유저 인증정보 조회
const getUserAuthInfo = async (): Promise<UserAuthInfoResponse> => {
  return await get(`/auth/me/account`);
};

//유저 디테일 조회
const getUserDetail = async (): Promise<UserDetailResponse> => {
  return await get(`/users/me/details`);
};

//유저 디테일 수정
const updateUserDetail = async (
  payload: UserDetailPatchRequest
): Promise<void> => {
  return await patch(`/users/me/detail`, payload);
};

//내 예약 번개 조회
const getMyReservationLightning = async (): Promise<MyLightningResponse[]> => {
  const status = encodeURIComponent("모집,마감,강제마감");
  return await get(`/users/me/lightnings?status=${status}`);
};

//내 완료 번개 조회
const getMyCompletedLightning = async (): Promise<MyLightningResponse[]> => {
  const status = encodeURIComponent("종료");
  return await get(`/users/me/lightnings?status=${status}`);
};

// 내 회원 디테일 등록
const registerUserDetail = async (
  payload: UserDetailPostRequest
): Promise<void> => {
  return await post(`/users/me/details`, payload);
};

export default {
  getMyReservationLightning,
  getMyCompletedLightning,
  getUserAuthInfo,
  getUserDetail,
  getUserPageDetail,
  updateUserDetail,
  registerUserDetail,
  patchUserPageDetail
};
