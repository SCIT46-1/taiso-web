import { del, post, get } from "../api/request";
import { Lightning } from "./lightningService";

interface BookmarkLightningsResponse {
  bookmarkedLightnings: Lightning[];
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
  return await post(`/users/me/bookmarks/routes/${routeId}`);
};

// 루트 북마크 삭제
const deleteBookmarkRoute = async (routeId: number) => {
  return await del(`/users/me/bookmarks/routes/${routeId}`);
};

export default {
  bookmarkLightning,
  deleteBookmarkLightning,
  getBookmarkLightnings,
  bookmarkRoute,
  deleteBookmarkRoute,
};
