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
  return await post("/auth/kakao", { code });
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

export default {
  login,
  register,
  logout,
  authTest,
  kakaoLogin,
  authCheck,
  checkEmail,
  updateUserAuthInfo,
};
