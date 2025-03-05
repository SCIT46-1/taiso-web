import { useState } from "react";
import authService, {
  RegisterRequest,
  RegisterResponse,
} from "../services/authService";
import { useAuthStore } from "../stores/useAuthStore";
import { useNavigate } from "react-router";

function RegisterForm({ redirectPath = "/" }) {
  // 디버깅 로그 추가
  console.log("RegisterForm - Redirect path:", redirectPath);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [passwordConfirm, setPasswordConfirm] = useState<string>("");

  const [emailError, setEmailError] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");
  const [passwordConfirmError, setPasswordConfirmError] = useState<string>("");
  const [error, setError] = useState<string>("");

  // 중복 체크 관련 상태: null은 아직 체크 안함, true면 사용가능, false면 중복
  const [isEmailAvailable, setIsEmailAvailable] = useState<boolean | null>(
    null
  );
  const [emailDuplicateError, setEmailDuplicateError] = useState<string>("");

  const [loading, setLoading] = useState(false);

  // 인풋 터치 여부
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [passwordConfirmTouched, setPasswordConfirmTouched] = useState(false);

  const { setUser } = useAuthStore();
  const navigate = useNavigate();

  // 정규식 검증
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[0-9]).{8,25}$/;

  // 이메일 인풋 스타일: 에러가 있으면 input-error, 중복 체크 성공 시에만 input-success 적용
  const emailInputClass = `input input-bordered w-full flex items-center gap-2 ${
    error || emailDuplicateError
      ? "input-error"
      : isEmailAvailable === true
      ? "input-success"
      : ""
  }`;

  const passwordInputClass = `input input-bordered w-full flex items-center gap-2 ${
    error
      ? "input-error"
      : passwordTouched && password.length > 0
      ? passwordRegex.test(password)
        ? "input-success"
        : "input-error"
      : ""
  }`;
  const passwordConfirmInputClass = `input input-bordered w-full flex items-center gap-2 ${
    error
      ? "input-error"
      : passwordConfirmTouched && passwordConfirm.length > 0
      ? password === passwordConfirm
        ? "input-success"
        : "input-error"
      : ""
  }`;

  // 회원가입 제출 처리
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 디버깅 로그 추가
    console.log("RegisterForm - Submit with redirect to:", redirectPath);

    // 기존 에러 초기화
    setEmailError("");
    setPasswordError("");
    setPasswordConfirmError("");
    setError("");

    // 클라이언트 검증
    if (email.length === 0 || !emailRegex.test(email)) {
      setEmailError("유효한 이메일 주소를 입력해 주세요!");
      return;
    }
    if (password.length === 0 || !passwordRegex.test(password)) {
      setPasswordError(
        "비밀번호는 8자 이상 25자 이하이며, 영문과 숫자를 포함해야 합니다!"
      );
      return;
    }
    if (password !== passwordConfirm) {
      setPasswordConfirmError("비밀번호가 일치하지 않습니다!");
      return;
    }

    const payload: RegisterRequest = { email, password };

    try {
      setLoading(true);
      const response: RegisterResponse = await authService.register(payload);
      setUser(
        {
          email: response.email,
          userId: response.userId,
          userNickname: response.userNickname,
        },
        false
      );
      // 리다이렉트 전 로그 추가
      console.log(
        "RegisterForm - Registration successful, redirecting to:",
        redirectPath
      );
      navigate(redirectPath);
    } catch (err: any) {
      console.error(err);
      if (err.response && err.response.status === 409) {
        setError("이미 등록된 이메일입니다.");
      } else {
        setError("회원가입에 실패했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  // 이메일 중복 체크 함수 (백엔드 API: 중복이면 true, 아니면 false)
  const checkEmail = async () => {
    // 이메일 포맷 검증 후 체크 진행
    if (!emailRegex.test(email)) {
      setEmailDuplicateError("유효한 이메일 주소를 입력해 주세요!");
      setIsEmailAvailable(false);
      return;
    }
    try {
      const isDuplicate = await authService.checkEmail(email);
      if (isDuplicate) {
        // 중복이면 사용 불가
        setIsEmailAvailable(false);
        setEmailDuplicateError("이미 등록된 이메일입니다.");
      } else {
        // 중복이 아니면 사용 가능
        setIsEmailAvailable(true);
        setEmailDuplicateError("");
      }
    } catch (err: any) {
      console.error(err);
      setIsEmailAvailable(false);
      setEmailDuplicateError("이메일 중복 확인에 실패했습니다.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col items-center justify-center max-w-sm mx-auto relative w-[20rem]"
    >
      <label className="label text-sm text-gray-500 mr-auto" htmlFor="email">
        이메일
      </label>
      {/* 이메일 인풋과 중복 체크 버튼을 같은 행에 배치 */}
      <div className="flex items-center gap-2 w-full">
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
              // 사용자가 이메일을 수정하면 중복체크 결과 초기화
              setIsEmailAvailable(null);
              setEmailDuplicateError("");
              if (emailError && emailRegex.test(e.target.value)) {
                setEmailError("");
              }
            }}
            onBlur={() => {
              if (email.length > 0 && !emailRegex.test(email)) {
                setEmailError("유효한 이메일 주소를 입력해 주세요!");
              } else {
                setEmailError("");
              }
            }}
            className="w-full"
          />
        </label>
        <button
          type="button"
          onClick={checkEmail}
          disabled={!email}
          className="btn "
        >
          중복 체크
        </button>
      </div>
      {/* 에러 메시지가 있으면 하나의 스팬에 표시 */}
      {(emailError || emailDuplicateError) && (
        <span className="mt-2 text-sm text-red-400 text-left w-full">
          {emailError || emailDuplicateError}
        </span>
      )}
      {/* 에러가 없고, 중복 체크에 성공한 경우 성공 메시지 표시 */}
      {!emailError && !emailDuplicateError && isEmailAvailable && (
        <span className="mt-2 text-sm text-green-500 text-left w-full">
          사용 가능한 이메일입니다.
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
          id="password"
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (passwordError && passwordRegex.test(e.target.value)) {
              setPasswordError("");
            }
          }}
          onBlur={() => {
            setPasswordTouched(true);
            if (password.length > 0 && !passwordRegex.test(password)) {
              setPasswordError(
                "비밀번호는 8자 이상 25자 이하이며, 영문과 숫자를 포함해야 합니다!"
              );
            } else {
              setPasswordError("");
            }
          }}
          className="w-full"
        />
      </label>
      {passwordError && (
        <span className="mt-2 text-sm text-red-400 text-left w-full">
          {passwordError}
        </span>
      )}

      <label
        className="label text-sm text-gray-500 mt-4 mr-auto"
        htmlFor="passwordConfirm"
      >
        비밀번호 확인
      </label>
      <label className={passwordConfirmInputClass}>
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
          id="passwordConfirm"
          type="password"
          placeholder="비밀번호 확인"
          value={passwordConfirm}
          onChange={(e) => {
            setPasswordConfirm(e.target.value);
            if (passwordConfirmError && password === e.target.value) {
              setPasswordConfirmError("");
            }
          }}
          onBlur={() => {
            setPasswordConfirmTouched(true);
            if (passwordConfirm.length > 0 && password !== passwordConfirm) {
              setPasswordConfirmError("비밀번호가 일치하지 않습니다!");
            } else {
              setPasswordConfirmError("");
            }
          }}
          className="w-full"
        />
      </label>
      {passwordConfirmError && (
        <span className="mt-2 text-sm text-red-400 text-left w-full">
          {passwordConfirmError}
        </span>
      )}

      {error && (
        <span className="mt-2 text-sm text-red-400 text-left w-full">
          {error}
        </span>
      )}

      <button
        type="submit"
        disabled={loading}
        className={`btn btn-primary btn-soft w-[20rem] ${
          loading ? "disabled" : ""
        } no-animation mt-10`}
      >
        {loading ? "회원가입 중..." : "회원가입"}
      </button>
    </form>
  );
}

export default RegisterForm;
