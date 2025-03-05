import { createBrowserRouter } from "react-router-dom";
import Root from "./root";
import MainPage from "./pages/MainPage";
import ProtectedRoute from "./ProtectedRoute";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import LandingPage from "./pages/auth/LandingPage";
import OAuthCallback from "./components/OAuthCallback";
import RoutePage from "./pages/RoutePage";
import ClubPage from "./pages/ClubPage";
import RouteDetailPage from "./pages/route/RouteDetailPage";
import NotFoundErrorPage from "./pages/error/NotFoundErrorPage";
import LightningPage from "./pages/LightningPage";
import LightningPostPage from "./pages/lightning/LightningPostPage";
import RoutePostPage from "./pages/route/RoutePostPage";
import LightningDetailPage from "./pages/lightning/lightningDetailPage";
import AuthRoute from "./AuthRoute";
import UserOnboardingPage from "./pages/auth/UserOnboardingPage";
import UserDetailPage from "./pages/UserDetailPage";
import UserDetailUpdate from "./pages/user/userDetailUpdate";
import UserAccountPage from "./pages/user/UserAccountPage";
import UserLightningPage from "./pages/user/UserLightningPage";
import UserLightningCompletePage from "./pages/user/UserLightningCompletePage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      // 인증 없이 접근 가능한 페이지들
      { path: "", element: <MainPage /> },

      //온보딩 테스트 페이지
      { path: "onboarding", element: <UserOnboardingPage /> },

      { path: "oauth/callback", element: <OAuthCallback /> },
      {
        path: "lightning",
        children: [
          { path: "", element: <LightningPage /> },
          { path: ":lightningId", element: <LightningDetailPage /> },
          // 인증 필요한 post 라우트는 아래 ProtectedRoute에서 다룸
        ],
      },
      {
        path: "route",
        children: [
          { path: "", element: <RoutePage /> },
          { path: ":routeId", element: <RouteDetailPage /> },
        ],
      },
      {
        path: "club",
        children: [{ path: "", element: <ClubPage /> }],
      },
      {
        path: "users",
        children: [{ path: ":userId", element: <UserDetailPage /> }],
      },
      // 인증 후에만 접근 가능한 post 관련 페이지들
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "lightning",
            children: [{ path: "post", element: <LightningPostPage /> }],
          },
          {
            path: "route",
            children: [{ path: "post", element: <RoutePostPage /> }],
          },
          {
            path: "user",
            children: [
              { path: "me/account", element: <UserAccountPage /> },
              { path: "me/update", element: <UserDetailUpdate /> },

              {
                path: "me/lightning-reservation",
                element: <UserLightningPage />,
              },
              {
                path: "me/lightning-completed",
                element: <UserLightningCompletePage />,
              },
              // { path: "me/club", element: <UserClubPage /> },
              // { path: "me/route", element: <UserRoutePage /> },
              // { path: "me/bookmark", element: <UserBookmarkPage /> },
            ],
          },
        ],
      },
    ],
  },
  // 로그인 등 인증로직 처리
  {
    path: "auth",
    element: <AuthRoute />,
    children: [
      { path: "landing", element: <LandingPage /> },
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
    ],
  },
  {
    path: "*",
    element: <NotFoundErrorPage />,
  },
]);

export default router;
