import { Link, useLocation } from "react-router";

function UserLightningVar() {
  const location = useLocation();

  return (
    <div className="flex justify-center mt-10 w-full no-animation">
      <div className="join flex w-full max-w-md">
        <Link to="/user/me/lightning-reservation" className="w-1/2">
          <button
            className={`join-item btn w-full border-gray-500 ${location.pathname === "/user/me/lightning-reservation"
              ? "btn-primary hover:border-gray-500"
                : "btn-outline border-gray-500 hover:bg-gray-300 hover:border-gray-500"
              }`}
          >
            예약한 번개
          </button>
        </Link>
        <Link to="/user/me/lightning-completed" className="w-1/2">
          <button
            className={`join-item btn w-full border-gray-500 ${location.pathname === "/user/me/lightning-completed"
                ? "btn-primary hover:border-gray-500"
                : "btn-outline border-gray-500 hover:bg-gray-300 hover:border-gray-500"
              }`}
          >
            완료 번개
          </button>
        </Link>
      </div>
    </div>

  );
}

export default UserLightningVar;
