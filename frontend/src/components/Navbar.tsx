import { useState } from "react";
import authService from "../services/authService";
import { useAuthStore } from "../stores/useAuthStore";
import { Link } from "react-router";

function Navbar() {
  const { logout, isAuthenticated, user } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    authService.logout();
    logout();
  };

  const handleThemeToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.setAttribute("data-theme", "light");
    }
  };

  return (
    <>
      <div className="navbar -mt-1">
        <div className="flex-1">
          <Link to="/" className="btn btn-ghost text-xl no-animation font-mono">
            taiso
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
              className="btn btn-ghost btn-circle avatar cursor-pointer"
            >
              <div className="w-10 rounded-full">
                <img
                  alt="Avatar"
                  src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
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
                  src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                />
              </div>
            </div>
            <div className="text-sm font-bold">이시형</div>
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
                <Link to="/settings">내 클럽 정보</Link>
              </li>
              <li>
                <Link to="/settings">내 루트 정보</Link>
              </li>
              <li>
                <Link to="/settings">북마크</Link>
              </li>
              <li>
                <div onClick={handleLogout}>로그아웃</div>
              </li>
            </>
          </ul>
          <label className="swap swap-rotate mr-2">
            <input
              type="checkbox"
              className="theme-controller"
              value="synthwave"
              onChange={handleThemeToggle}
            />
            <svg
              className="swap-off h-8 w-8 fill-current"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" />
            </svg>
            <svg
              className="swap-on h-8 w-8 fill-current"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z" />
            </svg>
          </label>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="mt-4 btn btn-sm"
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
