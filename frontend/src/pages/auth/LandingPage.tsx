import { Link, useLocation } from "react-router-dom";

function LandingPage() {
  const location = useLocation();
  console.log("Landing page state:", location.state);
  const fromPath = location.state?.from || "/";

  const encodedRedirectPath = encodeURIComponent(fromPath);
  const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?client_id=${
    import.meta.env.VITE_KAKAO_CLIENT_ID
  }&redirect_uri=http://localhost:3000/oauth/callback&response_type=code&state=${encodedRedirectPath}`;

  const handleKakaoLogin = () => {
    window.location.href = KAKAO_AUTH_URL;
  };

  return (
    <div className="flex flex-col items-center justify-center sm:mt-14 mt-20">
      <div className="text-4xl font-bold mb-4">Taiso</div>
      <div className="text-xl mb-36 font-light">
        로그인하고 번개에 참여해보세요!
      </div>

      <div className="flex flex-col gap-4">
        <div
          onClick={handleKakaoLogin}
          className="btn w-[20rem] bg-yellow-300 no-animation hover:bg-yellow-400 font-bold"
        >
          카카오 로그인하기
        </div>
        <Link to="/auth/login" state={{ from: fromPath }}>
          <div className="btn no-animation w-[20rem] font-bold">
            로그인 하기
          </div>
        </Link>
        <div className="text-sm divider ">아직 아이디가 없으신가요?</div>
        <Link to="/auth/register" state={{ from: fromPath }}>
          <div className="btn no-animation w-[20rem] font-bold">
            회원가입 하기
          </div>
        </Link>
      </div>
    </div>
  );
}

export default LandingPage;
