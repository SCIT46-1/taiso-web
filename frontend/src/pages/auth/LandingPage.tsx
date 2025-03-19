import { Link, useLocation } from "react-router-dom";

function LandingPage() {
  const location = useLocation();
  console.log("Landing page state:", location.state);
  const fromPath = location.state?.from || "/";

  const encodedRedirectPath = encodeURIComponent(fromPath);
  const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?client_id=${
    import.meta.env.VITE_KAKAO_CLIENT_ID
  }&redirect_uri=https://taiso.site/oauth/callback&response_type=code&state=${encodedRedirectPath}`;

  const handleKakaoLogin = () => {
    window.location.href = KAKAO_AUTH_URL;
  };

  return (
    <div className="flex flex-col items-center justify-center sm:mt-14 mt-20">
      <div className="text-3xl font-bold mb-6 mt-10">
        자전거 번개와 함께, taiso
      </div>
      <div className="text-lg mb-36 ">로그인하고 번개에 참여해보세요!</div>

      <div className="flex flex-col gap-4">
        <div
          onClick={handleKakaoLogin}
          className="btn w-[20rem] bg-yellow-300 no-animation hover:bg-yellow-400 font-bold"
        >
          <svg
            width="800px"
            height="800px"
            viewBox="0 0 512 512"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            className="w-[20px] h-[20px]"
          >
            <path
              fill="#000000"
              d="M253.722 32C297.607 32 338.196 40.5332 375.489 57.5996C412.782 74.6659 442.265 97.8726 463.936 127.22C485.608 156.567 496.444 188.577 496.444 223.252C496.444 257.926 485.608 289.982 463.936 319.42C442.265 348.857 412.827 372.109 375.625 389.175C338.422 406.241 297.787 414.775 253.722 414.775C239.816 414.775 225.458 413.781 210.65 411.795C146.357 456.402 112.134 478.977 107.98 479.518C105.994 480.241 104.098 480.151 102.292 479.248C101.569 478.706 101.027 477.983 100.666 477.08C100.305 476.177 100.124 475.365 100.124 474.642V473.559C101.208 466.515 109.425 437.169 124.776 385.518C89.9207 368.181 62.2443 345.2 41.7466 316.575C21.2489 287.951 11 256.843 11 223.252C11 188.577 21.8358 156.567 43.5074 127.22C65.179 97.8726 94.6614 74.6659 131.955 57.5996C169.248 40.5332 209.837 32 253.722 32ZM130.736 273.909V190.744H152.136C155.026 190.744 158.051 189.706 161.211 187.629C164.372 185.552 165.952 182.708 165.952 179.096C165.952 175.484 164.507 172.459 161.618 170.021C158.728 167.583 155.929 166.364 153.22 166.364H82.7872C79.717 166.364 76.8275 167.267 74.1185 169.073C71.4096 170.879 70.0551 173.859 70.0551 178.012C70.0551 182.166 71.4999 185.327 74.3894 187.494C77.279 189.661 80.5297 190.744 84.1416 190.744H105.542V273.909C105.542 278.424 106.626 282.126 108.793 285.016C110.96 287.905 114.03 289.35 118.003 289.35C121.977 289.35 125.092 287.725 127.349 284.474C129.607 281.223 130.736 277.702 130.736 273.909ZM248.033 289.35C254.715 286.822 256.792 280.411 254.264 270.117C253.541 267.769 248.439 253.728 238.958 227.992C229.477 202.257 224.014 187.584 222.569 183.972C217.693 172.233 211.011 166.364 202.523 166.364C193.312 166.364 186.179 172.233 181.122 183.972C179.677 187.042 174.169 201.987 164.597 228.805C155.026 255.624 150.059 269.394 149.698 270.117C148.434 271.742 148.118 274.722 148.75 279.056C149.382 283.391 151.324 286.37 154.574 287.996C158.186 289.621 161.708 289.802 165.139 288.538C168.571 287.273 170.918 285.377 172.182 282.849L178.684 264.97H225.82C227.806 271.471 229.251 275.715 230.154 277.702C231.057 279.508 232.05 281.314 233.134 283.12C234.217 284.926 236.204 286.686 239.094 288.402C241.983 290.118 244.963 290.434 248.033 289.35ZM320.904 289.35C324.696 289.35 328.173 288.176 331.333 285.829C334.494 283.481 336.074 280.32 336.074 276.347C336.074 272.374 334.629 269.259 331.74 267.001C328.85 264.744 325.238 263.615 320.904 263.615H290.834V181.805C290.834 178.012 289.706 174.491 287.448 171.24C285.191 167.989 282.076 166.364 278.102 166.364C274.129 166.364 271.059 167.809 268.892 170.698C266.725 173.588 265.641 177.29 265.641 181.805V273.909C265.641 278.424 266.725 282.126 268.892 285.016C271.059 287.905 274.129 289.35 278.102 289.35C278.283 289.35 278.599 289.305 279.051 289.215C279.502 289.124 279.818 289.079 279.999 289.079C280.179 289.079 280.495 289.124 280.947 289.215C281.398 289.305 281.714 289.35 281.895 289.35H320.904ZM427.636 287.454C430.707 284.564 432.242 281.268 432.242 277.566C432.242 273.864 431.068 270.568 428.72 267.679C427.636 266.053 416.259 250.793 394.587 221.897C405.062 211.242 415.627 200.587 426.282 189.932C428.991 187.223 430.661 184.017 431.293 180.315C431.926 176.613 430.887 173.136 428.178 169.886C425.108 166.996 421.812 165.822 418.29 166.364C414.769 166.906 411.473 168.712 408.403 171.782C407.861 172.324 405.513 174.716 401.36 178.96C397.206 183.205 391.833 188.668 385.241 195.35C378.65 202.032 372.825 207.991 367.769 213.229V181.805C367.769 178.012 366.64 174.491 364.382 171.24C362.125 167.989 359.01 166.364 355.037 166.364C351.063 166.364 347.993 167.809 345.826 170.698C343.659 173.588 342.575 177.29 342.575 181.805V273.909C342.575 278.424 343.659 282.126 345.826 285.016C347.993 287.905 351.063 289.35 355.037 289.35C359.01 289.35 362.125 287.725 364.382 284.474C366.64 281.223 367.769 277.702 367.769 273.909V249.258C368.491 248.535 369.845 247.136 371.832 245.059C373.819 242.982 375.444 241.311 376.708 240.047C388.628 256.301 399.283 270.658 408.674 283.12C411.202 286.551 414.137 288.763 417.478 289.757C420.819 290.75 424.205 289.982 427.636 287.454ZM185.998 240.589L202.523 192.099L218.776 240.589H185.998Z"
            ></path>
          </svg>
          카카오로 간편 로그인
        </div>
        <Link to="/auth/login" state={{ from: fromPath }}>
          <div className="btn no-animation w-[20rem] font-bold">로그인</div>
        </Link>
        <div className="text-sm divider ">아직 아이디가 없으신가요?</div>
        <Link to="/auth/register" state={{ from: fromPath }}>
          <div className="btn no-animation w-[20rem] font-bold">회원가입</div>
        </Link>
      </div>
    </div>
  );
}

export default LandingPage;
