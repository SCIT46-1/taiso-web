import { Outlet } from "react-router";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

function Root() {
  return (
    <div className="flex flex-col items-center justify-center max-w-screen-lg mx-auto">
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  );
}

export default Root;
