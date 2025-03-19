// src/api/axiosClient.ts
// If needed for Vite type support, add at the top:
// /// <reference types="vite/client" />

import axios, { AxiosResponse, AxiosError } from "axios";
import { useAuthStore } from "../stores/useAuthStore";
// import { useAuthStore } from "../stores/useAuthStore";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL as string,
  timeout: 50000,
  withCredentials: true, // HttpOnly 쿠키 사용 시 필수!
});

// 요청 인터셉터: HttpOnly 쿠키를 사용하는 경우, 별도의 토큰 추가 로직이 필요 없음
axiosClient.interceptors.request.use(
  (config) => {
    // 추가적인 config 설정이 필요한 경우 이곳에서 처리
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// 응답 인터셉터: 401 에러 발생 시 로그인 상태 만료 처리
axiosClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response) {
      const { status } = error.response;
      switch (status) {
        case 400:
          console.error("잘못된 요청입니다.");
          break;
        case 401:
          console.error("인증 오류: 로그인 상태가 만료되었습니다.");
          // Instead of calling a hook, retrieve logout from the store's state.
          useAuthStore.getState().logout();
          break;
        case 403:
          console.error("권한 없음: 접근할 수 없는 리소스입니다.");
          break;
        case 404:
          console.error("리소스 없음: 요청한 리소스를 찾을 수 없습니다.");
          break;
        case 422:
          console.error("잘못된 입력: 요청 데이터가 유효하지 않습니다.");
          break;
        case 500:
          console.error("서버 오류: 요청을 처리하는 동안 오류가 발생했습니다.");
          break;
        default:
          console.error("오류 발생: 알 수 없는 오류");
          break;
      }
    } else if (error.request) {
      console.error("요청 오류: 요청을 보내는 동안 오류가 발생했습니다.");
    } else {
      console.error("오류 발생: 알 수 없는 오류");
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
