import MainNavbar from "../components/MainNavbar";
import MainLightningCards from "../components/mainPages/MainLightningCards";
import MainRouteCards from "../components/mainPages/MainRouteCards";

function MainPage() {
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
