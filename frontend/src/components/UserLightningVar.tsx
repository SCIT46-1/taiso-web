import { Link, useLocation } from "react-router";

function UserLightningVar() {
  const location = useLocation();

  return (
    <div>
      <div className="flex gap-4 w-full justify-center mt-10">
        <Link to="/user/me/lightning-reservation">
          <div
            className={`badge badge-primary badge-lg ${
              location.pathname === "/user/me/lightning-reservation"
                ? ""
                : "badge-outline"
            }`}
          >
            예약한 번개
          </div>
        </Link>
        <Link to="/user/me/lightning-completed">
          <div
            className={`badge badge-secondary badge-lg ${
              location.pathname === "/user/me/lightning-completed"
                ? ""
                : "badge-outline"
            }`}
          >
            완료 번개
          </div>
        </Link>
      </div>
    </div>
  );
}

export default UserLightningVar;
