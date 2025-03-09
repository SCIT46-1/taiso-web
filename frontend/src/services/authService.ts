import { get, patch } from "../api/request";
import { post } from "../api/request";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  userId: number;
  userEmail: string;
  userNickname: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface RegisterResponse {
  userId: number;
  email: string;
  userNickname: string;
}

export interface AuthTestResponse {
  message: string;
  timestamp: string;
  status: string;
}

export interface KakaoAuthResultDTO {
  userId: number;
  userEmail: string;
  userNickname: string;
  newUser: boolean;
}

export interface UpdateUserAuthInfoRequest {
  currentPassword: string;
  password: string;
}

const login = async (payload: LoginRequest): Promise<LoginResponse> => {
  const response: LoginResponse = await post("/auth/login", payload);
  console.log(response);
  return response;
};

const register = async (
  payload: RegisterRequest
): Promise<RegisterResponse> => {
  return await post("/auth/register", payload);
};

const logout = async (): Promise<void> => {
  return await post("/auth/logout", {});
};

const authTest = async (): Promise<AuthTestResponse> => {
  return await get("/test");
};

const kakaoLogin = async (code: string): Promise<KakaoAuthResultDTO> => {
  const response: KakaoAuthResultDTO = await post("/auth/kakao", { code });
  console.log("kakaoLogin - response:", response);
  return response;
};

const authCheck = async (): Promise<void> => {
  return await get("/auth/me");
};

const checkEmail = async (email: string): Promise<boolean> => {
  return await get(`/auth/check-email?email=${email}`);
};

const updateUserAuthInfo = async (
  payload: UpdateUserAuthInfoRequest
): Promise<void> => {
  return await patch("/auth/me", payload);
};

const checkNickname = async (nickname: string): Promise<boolean> => {
  return await get(`/auth/check-nickname?nickname=${nickname}`);
};

const getNickname = async (): Promise<string> => {
  return await get("/auth/me/nickname");
};

export default {
  login,
  register,
  logout,
  authTest,
  kakaoLogin,
  authCheck,
  checkEmail,
  checkNickname,
  getNickname,
  updateUserAuthInfo,
};
