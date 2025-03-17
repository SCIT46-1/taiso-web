import { Navigate, Outlet } from "react-router";
import { useAuthStore } from "./stores/useAuthStore";
import AuthNavbar from "./components/AuthNavbar";

function AuthRoute() {
  const { isAuthenticated } = useAuthStore();
  // 인증되어있는 경우 메인 페이지로 이동
  if (isAuthenticated) {
    console.log("isAuthenticated", isAuthenticated);
    return <Navigate to="/" />;
  }
  return (
    <div className="flex flex-col items-center max-w-screen-lg mx-auto min-h-screen">
      <AuthNavbar />
      <Outlet />
    </div>
  );
}

export default AuthRoute;
