import { del, post, get } from "../api/request";

export interface BookmarkLightningsResponse {
  lightningId: number;
  creatorId: number;
  title: string;
  eventDate: string;
  duration: number;
  createdAt: string;
  status: string;
  capacity: number;
  currentParticipants: number | null;
  gender: string;
  level: string;
  bikeType: string;
  tags: string[];
  address: string;
  routeImgId: string;
  joinedAt: string;
}

export interface BookmarkRoutesResponse {
  bookmarkId: number;
  userId: number;
  bookmarkedRouteId: number;
  totalBookmark: number;
  createdAt: string;
  routeId: number;
  routeImgId: string;
  routeName: string;
  likeCount: number;
  tags: string[];
  distance: number;
  altitude: number;
  region: string;
  distanceType: string;
  altitudeType: string;
  roadType: string;
  bookmarkcreatedAt: string;
}

export interface BookmarkUsersResponse {
  bookmarkId: number;
  userId: number;
  bookmarkedUserId: number;
  totalBookmark: number;
  createdAt: string;
  userNickname: string;
  userProfileImg: string | null;
  gender: string;
  level: string;
}

// Club 개별 클럽 정보에 대한 인터페이스
export interface Club {
  clubId: number;
  bookmarked: boolean;
  clubProfileImageId: string;
  clubName: string;
  clubLeaderId: number;
  clubLeaderName: string;
  clubLeaderProfileImageId: string;
  clubShortDescription: string;
  maxScale: number;
  currentScale: number;
  tags: string[]; // 빈 배열이지만 아마도 string[] 타입일 것으로 가정
}

// 페이징된 클럽 목록 응답에 대한 인터페이스
export interface BookmarkClubsResponse {
  content: Club[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

// 번개 북마크 생성
const bookmarkLightning = async (lightningId: number) => {
  return await post(`/users/me/bookmarks/lightnings/${lightningId}`);
};

// 번개 북마크 삭제
const deleteBookmarkLightning = async (lightningId: number) => {
  return await del(`/users/me/bookmarks/lightnings/${lightningId}`);
};

// 번개 북마크 조회
const getBookmarkLightnings = async (): Promise<
  BookmarkLightningsResponse[]
> => {
  return await get(`/users/me/bookmarks/lightnings`);
};

// 루트 북마크 생성
const bookmarkRoute = async (routeId: number) => {
  return await post(`/users/me/bookmarks/route/${routeId}`);
};

// 루트 북마크 삭제
const deleteBookmarkRoute = async (routeId: number) => {
  return await del(`/users/me/bookmarks/route/${routeId}`);
};

// 루트 북마크 조회
const getBookmarkRoutes = async (): Promise<BookmarkRoutesResponse[]> => {
  return await get(`/users/me/bookmarks/route`);
};

// 유저 북마크 조회
const getBookmarkUsers = async (): Promise<BookmarkUsersResponse[]> => {
  return await get(`/users/me/bookmarks/users`);
};

// 클럽 북마크 조회
const getBookmarkClubs = async (): Promise<BookmarkClubsResponse> => {
  return await get(`/users/me/bookmarks/clubs`);
};

// 유저 북마크 생성
const bookmarkUser = async (userId: number) => {
  return await post(`/users/me/bookmarks/users/${userId}`);
};

// 클럽 북마크 생성
const bookmarkClub = async (clubId: number) => {
  return await post(`/users/me/bookmarks/clubs/${clubId}`);
};

// 유저 북마크 삭제
const deleteBookmarkUser = async (userId: number) => {
  return await del(`/users/me/bookmarks/users/${userId}`);
};

// 클럽 북마크 삭제
const deleteBookmarkClub = async (clubId: number) => {
  return await del(`/users/me/bookmarks/clubs/${clubId}`);
};

export default {
  bookmarkLightning,
  deleteBookmarkLightning,
  getBookmarkLightnings,
  bookmarkRoute,
  deleteBookmarkRoute,
  getBookmarkRoutes,
  bookmarkUser,
  deleteBookmarkUser,
  bookmarkClub,
  deleteBookmarkClub,
  getBookmarkClubs,
  getBookmarkUsers,
};
