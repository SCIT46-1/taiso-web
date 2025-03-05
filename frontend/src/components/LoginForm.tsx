import { useState } from "react";
import authService, {
  LoginRequest,
  LoginResponse,
} from "../services/authService";
import { useAuthStore } from "../stores/useAuthStore";
import { useNavigate } from "react-router-dom";

function LoginForm({ redirectPath = "/" }) {
  // 디버깅 로그 추가
  console.log("LoginForm - Redirect path:", redirectPath);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const [emailError, setEmailError] = useState<string>("");
  const [error, setError] = useState<string>("");
  const { setUser } = useAuthStore();
  const navigate = useNavigate();

  // 인풋 터치 여부 추적
  const [emailTouched, setEmailTouched] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const [loading, setLoading] = useState(false);
  const [loginFailed, setLoginFailed] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoginFailed(false);

    // 디버깅 로그 추가
    console.log("LoginForm - Submit with redirect to:", redirectPath);

    // 이메일 검증 (이미 터치되어 있다면)
    if (email.length > 0 && !emailRegex.test(email)) {
      setEmailError("올바른 이메일을 입력해 주세요!");
      return;
    } else {
      setEmailError("");
    }

    const payload: LoginRequest = { email, password };

    try {
      setLoading(true);
      const response: LoginResponse = await authService.login(payload);
      setUser({ email: response.userEmail, userId: response.userId });
      // 리다이렉트 경로로 이동 전 로그 추가
      console.log(
        "LoginForm - Login successful, redirecting to:",
        redirectPath
      );
      navigate(redirectPath);
    } catch (err) {
      console.error(err);
      setLoginFailed(true);
      setError("이메일 또는 비밀번호를 다시 확인해 주세요!");
    } finally {
      setLoading(false);
    }
  };

  // 이메일 인풋 클래스: 로그인 실패 시 강제 에러, 그 외에는 터치 여부와 값에 따라 success/error 적용
  const emailInputClass = `input input-bordered w-full flex items-center gap-2 ${
    loginFailed
      ? "input-error"
      : emailTouched && email.length > 0
      ? emailRegex.test(email)
        ? "input-success"
        : "input-error"
      : ""
  }`;

  // 비밀번호 인풋은 기본 스타일, 로그인 실패 시 에러 클래스 추가
  const passwordInputClass = `input input-bordered w-full flex items-center gap-2 ${
    loginFailed ? "input-error" : ""
  }`;

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col items-center justify-center max-w-sm mx-auto relative w-[20rem]"
    >
      <label className="label text-sm text-gray-500 mr-auto " htmlFor="email">
        이메일
      </label>
      <label className={emailInputClass}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          fill="currentColor"
          className="h-4 w-4 opacity-70"
        >
          <path d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z" />
          <path d="M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z" />
        </svg>
        <input
          id="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (loginFailed) setLoginFailed(false);
            // 입력 중에는 onBlur에서 검증하므로 여기서는 에러 초기화만 진행
          }}
          className="w-full"
          onBlur={() => {
            setEmailTouched(true);
            if (email.length > 0 && !emailRegex.test(email)) {
              setEmailError("올바른 이메일을 입력해 주세요!");
            } else {
              setEmailError("");
            }
          }}
        />
      </label>
      {/* emailError가 있을 경우 항상 오류 span 표시 */}
      {emailError && (
        <span className="mt-2 text-sm text-red-400 text-left w-full">
          {emailError}
        </span>
      )}

      <label
        className="label text-sm text-gray-500 mt-4 mr-auto"
        htmlFor="password"
      >
        비밀번호
      </label>
      <label className={passwordInputClass}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          fill="currentColor"
          className="h-4 w-4 opacity-70"
        >
          <path
            fillRule="evenodd"
            d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z"
            clipRule="evenodd"
          />
        </svg>
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (loginFailed) setLoginFailed(false);
          }}
          className="w-full"
        />
      </label>

      {error && (
        <span className="mt-2 text-sm text-red-400 text-left w-full">
          {error}
        </span>
      )}

      <div className="form-control mt-12"></div>
      <button
        type="submit"
        disabled={loading}
        className={`btn btn-primary btn-soft w-[20rem] ${
          loading ? "disabled" : ""
        } no-animation`}
      >
        {loading ? "로그인 중..." : "로그인"}
      </button>
    </form>
  );
}

export default LoginForm;
