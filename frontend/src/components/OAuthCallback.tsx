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
    // state 파라미터 가져오기 및 디코딩
    const encodedRedirectPath = query.get("state");
    console.log("OAuthCallback - Encoded redirect path:", encodedRedirectPath);

    // state가 있으면 디코딩, 없으면 기본 경로 사용
    const redirectPath = encodedRedirectPath
      ? decodeURIComponent(encodedRedirectPath)
      : "/";

    console.log("OAuthCallback - Decoded redirect path:", redirectPath);

    if (code) {
      console.log("OAuthCallback - Kakao login with code:", code);
      authService
        .kakaoLogin(code)
        .then((result) => {
          console.log("OAuthCallback - Kakao login successful");
          setUser(
            {
              email: result.userEmail,
              userId: result.userId,
              userNickname: result.userNickname,
            },
            true
          );
          console.log("OAuthCallback - result.isNewUser:", result.newUser);
          if (result.newUser) {
            navigate("/user-onboarding");
          } else {
            console.log("OAuthCallback - Redirecting to:", redirectPath);
            navigate(redirectPath);
          }
        })
        .catch((error) => {
          console.error("OAuthCallback - Kakao login error:", error);
        });
    }
  }, [location, navigate, setUser]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <span className="bg-blue-700 loading loading-dots loading-lg"></span>
    </div>
  );
};

export default OAuthCallback;
