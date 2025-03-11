import { lazy, Suspense, ComponentType, FC } from "react";
import { createBrowserRouter } from "react-router-dom";

// 로딩 컴포넌트를 래핑하는 헬퍼 함수
const Loadable = <P extends object>(Component: ComponentType<P>): FC<P> => {
  return (props: P) => (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-screen"></div>
      }
    >
      <Component {...props} />
    </Suspense>
  );
};

// 페이지별 lazy import 처리
const Root = Loadable(lazy(() => import("./root")));
const MainPage = Loadable(lazy(() => import("./pages/MainPage")));
const ProtectedRoute = Loadable(lazy(() => import("./ProtectedRoute")));
const LoginPage = Loadable(lazy(() => import("./pages/auth/LoginPage")));
const RegisterPage = Loadable(lazy(() => import("./pages/auth/RegisterPage")));
const LandingPage = Loadable(lazy(() => import("./pages/auth/LandingPage")));
const OAuthCallback = Loadable(
  lazy(() => import("./components/OAuthCallback"))
);
const RoutePage = Loadable(lazy(() => import("./pages/RoutePage")));
const ClubPage = Loadable(lazy(() => import("./pages/ClubPage")));
const RouteDetailPage = Loadable(
  lazy(() => import("./pages/route/RouteDetailPage"))
);
const NotFoundErrorPage = Loadable(
  lazy(() => import("./pages/error/NotFoundErrorPage"))
);
const LightningPage = Loadable(lazy(() => import("./pages/LightningPage")));
const LightningPostPage = Loadable(
  lazy(() => import("./pages/lightning/LightningPostPage"))
);
const RoutePostPage = Loadable(
  lazy(() => import("./pages/route/RoutePostPage"))
);
const LightningDetailPage = Loadable(
  lazy(() => import("./pages/lightning/lightningDetailPage"))
);
const AuthRoute = Loadable(lazy(() => import("./AuthRoute")));
const UserOnboardingPage = Loadable(
  lazy(() => import("./pages/auth/UserOnboardingPage"))
);
const UserDetailPage = Loadable(lazy(() => import("./pages/UserDetailPage")));
const UserDetailUpdate = Loadable(
  lazy(() => import("./pages/user/userDetailUpdate"))
);
const UserLightningPage = Loadable(
  lazy(() => import("./pages/user/UserLightningPage"))
);
const UserLightningCompletePage = Loadable(
  lazy(() => import("./pages/user/UserLightningCompletePage"))
);
const ClubDetailPage = Loadable(
  lazy(() => import("./pages/club/ClubDetailPage"))
);
const ClubPostPage = Loadable(lazy(() => import("./pages/club/ClubPostPage")));
const UserAccountUpdatePage = Loadable(
  lazy(() => import("./pages/user/UserAccountUpdatePage"))
);
const UserAccountPage = Loadable(
  lazy(() => import("./pages/user/UserAccountPage"))
);
const BookMarkPage = Loadable(lazy(() => import("./pages/BookMarkPage")));

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
      // 인증이 필요한 페이지들
      {
        element: <ProtectedRoute />,
        children: [
          { path: "user-onboarding", element: <UserOnboardingPage /> },
          { path: "bookmark", element: <BookMarkPage /> },
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
    path: "*",
    element: <NotFoundErrorPage />,
  },
]);

export default router;
