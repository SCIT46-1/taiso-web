import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "./stores/useAuthStore";
import authService from "./services/authService";

function ProtectedRoute() {
  // 인증 확인
  authService.authCheck();

  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    // 인증되지 않은 사용자는 로그인 페이지로 리다이렉트
    return <Navigate to="/auth/landing" replace />;
  }

  // 인증된 경우 하위 라우트를 렌더링
  return (
    <>
      <Outlet />
    </>
  );
}

export default ProtectedRoute;
