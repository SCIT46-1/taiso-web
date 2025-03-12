import { Link, useLocation } from "react-router-dom";

function BookmarkNavBar() {
  const location = useLocation();
  const currentPath = location.pathname;

  // 네비게이션 링크 정보
  const navLinks = [
    { path: "/bookmark/route", label: "루트" },
    { path: "/bookmark/lightning", label: "라이트닝" },
    { path: "/bookmark/user", label: "유저" },
    { path: "/bookmark/club", label: "클럽" },
  ];

  return (
    <div className="flex justify-center mb-4 border-b">
      <div className="flex space-x-4 py-2">
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`px-4 py-2 text-center ${
              currentPath === link.path
                ? "font-bold border-b-2 border-blue-500"
                : "text-gray-500"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default BookmarkNavBar;
