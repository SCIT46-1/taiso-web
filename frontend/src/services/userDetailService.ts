import { get } from "../api/request";

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
  nickname: string;
  userProfileImg: string;
  userBackgroundImg: string;
  phoneNumber: string;
  birthDate: string;
  bio: string;
  gender: string;
  level: string;
  height: number;
  weight: number;
  FTP: number;
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

export interface UserDetailRequest {
  userId: number;
  userNickname: string;
  bio: string;
  profileImg: string;
  backgroundImg: string;
  level: string;
  gender: string;
  tags: string[];
}

export interface UserDetailResponse {
  userId: number;
  userNickname: string;
  bio: string;
  profileImg: string;
  backgroundImg: string;
  level: string;
  gender: string;
  tags: string[];
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

const getUserDetail = async (userId: number): Promise<UserDetailResponse> => {
  return await get(`/users/${userId}`);
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

export default {
  getUserDetail,
  getMyReservationLightning,
  getMyCompletedLightning,
};
