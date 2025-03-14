import { post, get, del } from "../api/request";

export interface RoutePostRequest {
  routeData: string;
  file: File;
}

export interface RoutePostResponse {
  message: string;
}

export interface RouteDetailResponse {
  routeId: number;
  routeImgId: string;
  userId: number;
  routeName: string;
  description: string;
  likeCount: number;
  originalFilePath: string;
  tag: string[];
  distance: number;
  altitude: number;
  distanceType: string;
  altitudeType: string;
  roadType: string;
  createdAt: string;
  fileName: string;
  fileType: string;
  routePoint: {
    route_point_id: string;
    sequence: number;
    latitude: number;
    longitude: number;
    elevation: number;
  }[];
  liked: boolean;
  bookmarked: boolean;
}

export interface RouteListPageResponse {
  content: RouteListResponse[];

  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  last: boolean;
}

export interface RouteListResponse {
  routeId: number;
  routeImgId: string;
  userId: number;
  routeName: string;
  likeCount: number;
  tag: string[];
  distance: number;
  altitude: number;
  distanceType: string;
  altitudeType: string;
  roadType: string;
  createdAt: string;
  liked: boolean;
  bookmarked: boolean;
}

const createRoute = async (
  payload: RoutePostRequest
): Promise<RoutePostResponse> => {
  const formData = new FormData();
  // JSON 데이터를 Blob으로 감싸고 application/json 타입 지정
  formData.append(
    "routeData",
    new Blob([payload.routeData], { type: "application/json" }),
    "routeData.json"
  );

  // 파일의 MIME 타입이 없거나 'application/octet-stream'이면 지원되는 타입으로 대체
  const fileType =
    payload.file.type && payload.file.type !== "application/octet-stream"
      ? payload.file.type
      : "image/png"; // 상황에 맞게 변경 (예: "image/jpeg", "application/pdf" 등)
  const fileWithType = new File([payload.file], payload.file.name, {
    type: fileType,
  });
  formData.append("file", fileWithType, fileWithType.name);

  // axios나 fetch를 사용할 때 Content-Type 헤더를 직접 지정하지 않도록 합니다.
  return await post<RoutePostResponse>("/routes", formData);
};

const getRouteDetail = async (
  routeId: number
): Promise<RouteDetailResponse> => {
  return await get(`/routes/${routeId}`);
};

const getRouteList = async (
  page: number,
  size: number,
  sort: string,
  region: string,
  distanceType: string,
  altitudeType: string,
  roadType: string,
  tags: string[]
): Promise<RouteListPageResponse> => {
  return await get(
    `/routes/?page=${page}&size=${size}&sort=${sort}&region=${region}&distanceType=${distanceType}&altitudeType=${altitudeType}&roadType=${roadType}&tag=${tags}`
  );
};

const likeRoute = async (routeId: number): Promise<RoutePostResponse> => {
  return await post(`/routes/${routeId}/like`);
};

const unlikeRoute = async (routeId: number): Promise<RoutePostResponse> => {
  return await del(`/routes/${routeId}/like`);
};

const deleteRoute = async (routeId: number): Promise<RoutePostResponse> => {
  return await del(`/routes/${routeId}`);
};

export default {
  createRoute,
  getRouteDetail,
  getRouteList,
  likeRoute,
  unlikeRoute,
  deleteRoute,
};

//
