import { Outlet } from "react-router";

function Root() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Outlet />
    </div>
  );
}

export default Root;
