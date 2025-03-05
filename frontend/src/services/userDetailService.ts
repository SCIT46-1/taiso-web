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

const getUserDetail = async (userId: number): Promise<UserDetailResponse> => {
  return await get(`/users/${userId}`);
};

export default {
  getUserDetail,
};
