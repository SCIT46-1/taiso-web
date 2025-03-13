import { useEffect, useState } from "react";
import authService from "../services/authService";
import { useAuthStore } from "../stores/useAuthStore";
import { Link } from "react-router";
import userDetailService from "../services/userDetailService";
import stravaService from "../services/stravaService";

function Navbar() {
  const { logout, isAuthenticated, user } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [profileImg, setProfileImg] = useState("");
  useEffect(() => {
    const fetchProfileImg = async () => {
      const profileImg = await userDetailService.getUserDetailProfileImg();
      setProfileImg(profileImg);
    };
    try {
      fetchProfileImg();
    } catch (error) {
      console.error(error);
    }
  }, []);

  const handleLogout = () => {
    authService.logout();
    logout();
  };

  const handleStravaLink = async () => {
    const stravaLink = await stravaService.getStravaLink();
    window.location.href = stravaLink;
  };

  return (
    <>
      <div className="navbar -mt-2 -mb-1">
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
                  <Link to="/profile">프로필</Link>
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
                <img alt="Avatar" src={profileImg || "userDefault.png"} />
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
                <img alt="Avatar" src={profileImg || "userDefault.png"} />
              </div>
            </div>
            <div className="text-sm font-bold">{user?.userNickname}</div>
          </div>
          <ul className="menu mb-4 mt-4">
            <>
              <li>
                <Link to={`/users/${user?.userId}`}>내 페이지</Link>
              </li>
              <li>
                <Link to="/user/me/account">계정 정보 수정</Link>
              </li>
              <li>
                <Link to="/user/me/lightning-reservation">
                  내 번개 예약 정보
                </Link>
              </li>
              <li>
                <Link to="/user/me/lightning-completed">내 번개 완료 정보</Link>
              </li>
              <li>
                <Link to="/user/me/club">내 클럽 정보</Link>
              </li>
              <li>
                <Link to="/bookmark/lightning">북마크</Link>
              </li>
              <li>
                <div onClick={handleStravaLink}>스트라바 연동</div>
              </li>
              <li>
                <div onClick={handleLogout}>로그아웃</div>
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
      <div className="w-screen h-[1.5px] bg-base-200 shadow-2xl -mt-1 mb-2"></div>
    </>
  );
}

export default Navbar;
