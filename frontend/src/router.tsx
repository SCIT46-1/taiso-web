import { createBrowserRouter } from "react-router-dom";
import Root from "./root";
import MainPage from "./pages/MainPage";
import ProtectedRoute from "./ProtectedRoute";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import LandingPage from "./pages/auth/LandingPage";
import OAuthCallback from "./components/OAuthCallback";
import UserClubPage from "./pages/user/UserClubPage";
import StravaSuccessPage from "./pages/strava/StravaSuccessPage";
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
import UserLightningPage from "./pages/user/UserLightningPage";
import UserLightningCompletePage from "./pages/user/UserLightningCompletePage";
import ClubDetailPage from "./pages/club/ClubDetailPage";
import ClubPostPage from "./pages/club/ClubPostPage";
import UserAccountUpdatePage from "./pages/user/UserAccountUpdatePage";
import UserAccountPage from "./pages/user/UserAccountPage";
import BookMarkedRoutePage from "./pages/bookmark/BookMarkedRoutePage";
import BookMarkedLightningPage from "./pages/bookmark/BookMarkedLightningPage";
import BookMarkedUserPage from "./pages/bookmark/BookMarkedUserPage";
import BookMarkedClubPage from "./pages/bookmark/BookMarkedClubPage";
import ServerErrorPage from "./pages/error/ServerErrorPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      // 인증 없이 접근 가능한 페이지
      { path: "", element: <MainPage /> },
      { path: "onboarding", element: <UserOnboardingPage /> },
      { path: "oauth/callback", element: <OAuthCallback /> },
      {
        path: "lightning",
        children: [
          { path: "", element: <LightningPage /> },
          { path: ":lightningId", element: <LightningDetailPage /> },
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
        children: [
          { path: "", element: <ClubPage /> },
          { path: ":clubId", element: <ClubDetailPage /> },
        ],
      },
      {
        path: "users",
        children: [{ path: ":userId", element: <UserDetailPage /> }],
      },
      { path: "strava-success", element: <StravaSuccessPage /> },
      // 인증이 필요한 페이지들
      {
        element: <ProtectedRoute />,
        children: [
          { path: "user-onboarding", element: <UserOnboardingPage /> },
          {
            path: "bookmark",
            children: [
              { path: "route", element: <BookMarkedRoutePage /> },
              { path: "lightning", element: <BookMarkedLightningPage /> },
              { path: "user", element: <BookMarkedUserPage /> },
              { path: "club", element: <BookMarkedClubPage /> },
            ],
          },
          {
            path: "lightning",
            children: [{ path: "post", element: <LightningPostPage /> }],
          },
          {
            path: "route",
            children: [{ path: "post", element: <RoutePostPage /> }],
          },
          {
            path: "club",
            children: [{ path: "post", element: <ClubPostPage /> }],
          },
          {
            path: "user",
            children: [
              { path: "me/account", element: <UserAccountPage /> },
              { path: "me/account/update", element: <UserAccountUpdatePage /> },
              { path: "me/update", element: <UserDetailUpdate /> },
              {
                path: "me/lightning-reservation",
                element: <UserLightningPage />,
              },
              {
                path: "me/lightning-completed",
                element: <UserLightningCompletePage />,
              },
              { path: "me/club", element: <UserClubPage /> },
            ],
          },
        ],
      },
    ],
  },
  // 인증 로직 처리 페이지 (로그인, 회원가입 등)
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
    path: "error",
    element: <ServerErrorPage />,
  },
  {
    path: "*",
    element: <NotFoundErrorPage />,
  },
]);

export default router;
