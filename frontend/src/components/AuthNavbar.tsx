import { Link } from "react-router";

function AuthNavbar() {
  const handleThemeToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      // 다크 테마 적용
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      // 라이트 테마 적용
      document.documentElement.setAttribute("data-theme", "light");
    }
  };

  return (
    <>
      <div className="navbar -mt-[0.4rem] -mb-1">
        <div className="flex-1">
          <Link
            to="/"
            className="btn btn-ghost text-xl no-animation  font-mono"
          >
            <img src="/logo.png" alt="logo" className="w-[65px] h-auto" />
          </Link>
        </div>
      </div>
      <div className="w-screen h-[1.5px] bg-base-200 -mt-[2px] mb-2"></div>
    </>
  );
}

export default AuthNavbar;
