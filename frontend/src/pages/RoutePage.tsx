import { Link } from "react-router-dom";
import MainNavbar from "../components/MainNavbar";
import RouteList from "../components/RouteList";

function RoutePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <MainNavbar />
      <div className="flex-1 w-full mx-auto ">
        <div className="fixed bottom-8 right-10 z-50">
          <Link to="/route/post" className="btn btn-primary btn-circle ">
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
        <RouteList />
      </div>
    </div>
  );
}

export default RoutePage;
