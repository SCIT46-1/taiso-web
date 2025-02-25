// src/pages/OAuthCallback.tsx
import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import authService from "../services/authService";
import { useAuthStore } from "../stores/useAuthStore";

const OAuthCallback: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  //전역 상태 관리 라이브러리 사용
  const { setUser } = useAuthStore();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const code = query.get("code");

    // state 값 검증 (CSRF 방지를 위해 실제 환경에서는 비교 로직 필요)
    if (code) {
      authService.kakaoLogin(code).then((result) => {
        setUser({
          email: result.userEmail,
          userId: result.userId,
        });
        navigate("/");
      });
    }
  }, [location, navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <span className="bg-blue-700 loading loading-dots loading-lg"></span>
    </div>
  );
};

export default OAuthCallback;
