import MainNavbar from "../components/MainNavbar";
import MainLightningCards from "../components/mainPages/MainLightningCards";
import MainRouteCards from "../components/mainPages/MainRouteCards";
import { Link } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";

function MainPage() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="">
      <MainNavbar />
      <div className="rounded-lg overflow-hidden px-16">
        <img
          src={"/mainDefault.png"}
          alt="main"
          className="w-full h-full rounded-xl overflow-hidden"
        />
      </div>
        {!isAuthenticated && (
        <div className="text-center text-sm text-white bg-primary bg-opacity-80 p-3 px-8 w-full my-3">
          <Link to="/auth/landing" className=" font-semibold text-lg">
            <span className="text-white font-semibold text-lg hover:underline">로그인 하고</span>{" "}
            번개에 참여해보세요!
          </Link>
        </div>
        )}
      <div className="flex flex-col mt-8 px-14">
        <div className="text-xl font-bold ml-3">
          지금 인기있는 루트를 달려봐요!
        </div>
        <MainRouteCards />
      </div>
      <div className="flex flex-col mt-8 px-14">
        <div className="text-xl font-bold ml-3">
          곧 시작하는 번개를 찾아볼까요?
        </div>
        <MainLightningCards />
      </div>
    </div>
  );
}

export default MainPage;
