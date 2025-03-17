import { useEffect, useState } from "react";
import authService from "../services/authService";
import { useAuthStore } from "../stores/useAuthStore";
import { Link, useNavigate } from "react-router-dom";
import userDetailService from "../services/userDetailService";
import stravaService from "../services/stravaService";

function Navbar() {
  const { logout, isAuthenticated, user } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [profileImg, setProfileImg] = useState("");
  const [imageError, setImageError] = useState(false);
  const navigate = useNavigate();

  console.log(profileImg);
  console.log(imageError);
  useEffect(() => {
    const fetchProfileImg = async () => {
      try {
        const profileImg = await userDetailService.getUserDetailProfileImg();
        setProfileImg(
          "https://taiso-web-gpx-file-space.s3.ap-southeast-2.amazonaws.com/" +
            profileImg
        );
        setImageError(false);
      } catch (error) {
        console.error("Failed to fetch profile image:", error);
        setImageError(true);
      }
    };

    if (isAuthenticated) {
      fetchProfileImg();
    }
  }, [isAuthenticated]);

  const handleSidebarLinkClick = () => {
    setIsSidebarOpen(false);
  };

  const handleLogout = () => {
    navigate("/");
    authService.logout();
    logout();
  };

  const handleStravaLink = async () => {
    const stravaLink = await stravaService.getStravaLink();
    window.location.href = stravaLink;
  };

  const handleImageError = () => {
    setImageError(true);
  };

  // 기본 이미지 경로를 절대 경로로 수정
  const defaultImagePath = "/userDefault.png";

  return (
    <>
      <div className="navbar -mt-2 -mb-1 px-4">
        <div className="flex-1">
          <Link to="/" className="btn btn-ghost text-xl no-animation font-mono">
            <img
              src="/logo.png"
              alt="Logo"
              style={{ width: "65px", height: "auto" }}
            />
          </Link>
        </div>
        <div className="flex-none gap-2">
          <ul className="menu menu-horizontal px-1">
            {isAuthenticated ? (
              <>
                <li>
                  <Link to={`/users/${user?.userId}`}>프로필</Link>
                </li>
                <li>
                  <div onClick={handleLogout}>로그아웃</div>
                </li>
              </>
            ) : (
              <li>
                <Link to="/auth/landing">회원가입/로그인</Link>
              </li>
            )}
          </ul>
          {isAuthenticated && (
            <div
              onClick={() => setIsSidebarOpen(true)}
              className="btn btn-ghost btn-circle avatar cursor-pointer no-animation"
            >
              <div className="w-10 rounded-full ">
                <img
                  alt="Avatar"
                  src={
                    !imageError && profileImg ? profileImg : defaultImagePath
                  }
                  onError={handleImageError}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 사이드바 외부 영역 클릭 시 사이드바를 닫기 위한 오버레이 */}
      {isSidebarOpen && isAuthenticated && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className={`fixed inset-0 z-40 bg-black transition-opacity duration-1000 ease-in-out ${
            isSidebarOpen ? "opacity-20" : "opacity-0 pointer-events-none"
          }`}
        />
      )}

      <div
        className={`fixed top-0 right-0 z-50 h-full w-80 bg-base-100 shadow-lg transition-transform duration-300 ${
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-4" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-2">
            <div className="btn btn-ghost btn-circle avatar cursor-pointer no-animation ">
              <div className="w-10 rounded-full">
                <img
                  alt="Avatar"
                  src={
                    !imageError && profileImg ? profileImg : defaultImagePath
                  }
                  onError={handleImageError}
                />
              </div>
            </div>
            <div className="text-sm font-bold">{user?.userNickname}</div>
          </div>
          <ul className="menu mb-4 mt-4">
            <>
              <li>
                <Link
                  to={`/users/${user?.userId}`}
                  onClick={handleSidebarLinkClick}
                >
                  내 페이지
                </Link>
              </li>
              <li>
                <Link to="/user/me/account" onClick={handleSidebarLinkClick}>
                  계정 정보 수정
                </Link>
              </li>
              <li>
                <Link
                  to="/user/me/lightning-reservation"
                  onClick={handleSidebarLinkClick}
                >
                  내 번개 예약 정보
                </Link>
              </li>
              <li>
                <Link
                  to="/user/me/lightning-completed"
                  onClick={handleSidebarLinkClick}
                >
                  내 번개 완료 정보
                </Link>
              </li>
              <li>
                <Link to="/user/me/club" onClick={handleSidebarLinkClick}>
                  내 클럽 정보
                </Link>
              </li>
              <li>
                <Link to="/bookmark/lightning" onClick={handleSidebarLinkClick}>
                  북마크
                </Link>
              </li>
              <li>
                <div
                  onClick={() => {
                    handleSidebarLinkClick();
                    handleStravaLink();
                  }}
                >
                  스트라바 연동
                </div>
              </li>
              <li>
                <div
                  onClick={() => {
                    handleLogout();
                    handleSidebarLinkClick();
                  }}
                >
                  로그아웃
                </div>
              </li>
            </>
          </ul>

          <button
            onClick={() => setIsSidebarOpen(false)}
            className="mt-2 btn btn-sm ml-4"
          >
            Close
          </button>
        </div>
      </div>
      <div className="w-full h-[1.5px] bg-base-200 shadow-2xl -mt-1 mb-2"></div>
    </>
  );
}

export default Navbar;
