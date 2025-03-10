import { Link } from "react-router";
import ClubList from "../components/ClubList";
import MainNavbar from "../components/MainNavbar";

function ClubPage() {
  return (
    <div className="w-full max-w-screen-md mx-auto">
      <MainNavbar />
      <ClubList />
      <div className="fixed bottom-8 right-10 z-50 no-animation">
        {/* 클럽 생성 버튼 */}
        <Link to="/club/post" className="btn btn-primary btn-circle">
          <svg
            data-slot="icon"
            fill="currentColor"
            className="size-8"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z"></path>
          </svg>
        </Link>
      </div>
    </div>
  );
}

export default ClubPage;
