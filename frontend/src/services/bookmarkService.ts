import { del, post, get } from "../api/request";
import { Lightning } from "./lightningService";

interface BookmarkLightningsResponse {
  bookmarkedLightnings: Lightning[];
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

// 번개 북마크 생성
const bookmarkLightning = async (lightningId: number) => {
  return await post(`/users/me/bookmarks/lightnings/${lightningId}`);
};

// 번개 북마크 삭제
const deleteBookmarkLightning = async (lightningId: number) => {
  return await del(`/users/me/bookmarks/lightnings/${lightningId}`);
};

// 번개 북마크 조회
const getBookmarkLightnings = async (): Promise<BookmarkLightningsResponse> => {
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

export default {
  bookmarkLightning,
  deleteBookmarkLightning,
  getBookmarkLightnings,
  bookmarkRoute,
  deleteBookmarkRoute,
  getBookmarkRoutes,
};
