import axiosClient from "./axiosClient";

export interface ApiResponse<T = any> {
  data: T;
  // 필요시 status, message 등 추가 필드 확장
}

// GET 요청: signal 인자를 추가하여 요청 취소 지원
export const get = async <T>(
  url: string,
  params?: any,
  signal?: AbortSignal
): Promise<T> => {
  const response = await axiosClient.get<T>(url, { params, signal });
  return response.data;
};

// POST, PUT, PATCH, DELETE 요청은 기본 형식을 유지 (필요시 signal 추가 가능)
export const post = async <T>(url: string, data?: any): Promise<T> => {
  const response = await axiosClient.post<T>(url, data);
  return response.data;
};

export const put = async <T>(url: string, data?: any): Promise<T> => {
  const response = await axiosClient.put<T>(url, data);
  return response.data;
};

export const patch = async <T>(url: string, data?: any): Promise<T> => {
  const response = await axiosClient.patch<T>(url, data);
  return response.data;
};

export const del = async <T>(url: string): Promise<T> => {
  const response = await axiosClient.delete<T>(url);
  return response.data;
};
