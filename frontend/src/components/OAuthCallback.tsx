// src/pages/OAuthCallback.tsx
import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import authService from "../services/authService";
import { useAuthStore } from "../stores/useAuthStore";

const OAuthCallback: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setUser } = useAuthStore();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const code = query.get("code");
    // state 파라미터: 리다이렉트 경로가 있다면 가져오고 없으면 기본값 "/"
    const encodedRedirectPath = query.get("state");
    const redirectPath = encodedRedirectPath
      ? decodeURIComponent(encodedRedirectPath)
      : "/";

    if (code) {
      authService
        .kakaoLogin(code)
        .then((result) => {
          // 로그인 성공 후 URL에서 쿼리 파라미터를 제거하여 재요청을 방지
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );

          // 사용자 정보 전역 상태에 저장
          setUser(
            {
              email: result.userEmail,
              userId: result.userId,
              userNickname: result.userNickname,
            },
            true
          );

          // 신규 가입이면 온보딩 페이지로, 아니라면 이전 경로(혹은 기본 경로)로 이동
          if (result.newUser) {
            navigate("/user-onboarding");
          } else {
            navigate(redirectPath);
          }
        })
        .catch((error) => {
          console.error("OAuthCallback - Kakao login error:", error);
          // 에러 발생 시 로그인 페이지 등으로 리다이렉션
          navigate("/login");
        });
    } else {
      // URL에 인증 코드가 없는 경우, 홈 또는 로그인 페이지로 리다이렉션
      navigate("/");
    }
  }, [location, navigate, setUser]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <span className="bg-blue-700 loading loading-dots loading-lg"></span>
    </div>
  );
};

export default OAuthCallback;
