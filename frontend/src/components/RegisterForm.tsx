import { useState } from "react";
import authService, {
  RegisterRequest,
  RegisterResponse,
} from "../services/authService";
import { useAuthStore } from "../stores/useAuthStore";
import { useNavigate } from "react-router";

function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  // 추가된 에러 상태
  const [emailError, setEmailError] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");
  const [passwordConfirmError, setPasswordConfirmError] = useState<string>("");
  // 서버 또는 기타 에러 메시지
  const [error, setError] = useState<string>("");

  // 로딩 상태
  const [loading, setLoading] = useState(false);

  const { setUser } = useAuthStore();
  const navigate = useNavigate();

  // 로그인 폼과 동일한 정규식 적용
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[0-9]).{8,25}$/;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 이전 에러 초기화
    setEmailError("");
    setPasswordError("");
    setPasswordConfirmError("");
    setError("");

    // 클라이언트측 검증
    if (!emailRegex.test(email)) {
      setEmailError("유효한 이메일 주소를 입력해 주세요!");
      return;
    }

    if (!passwordRegex.test(password)) {
      setPasswordError(
        "비밀번호는 8자 이상 25자 이하이며, 영문과 숫자를 포함해야 합니다!"
      );
      return;
    }

    if (password !== passwordConfirm) {
      setPasswordConfirmError("비밀번호가 일치하지 않습니다!");
      return;
    }

    setLoading(true);

    const payload: RegisterRequest = {
      email,
      password,
    };

    try {
      const response: RegisterResponse = await authService.register(payload);
      setUser({ email: response.email, userId: response.userId });
      navigate("/");
    } catch (error: any) {
      if (error.response && error.response.status === 409) {
        setError("이미 등록된 이메일입니다.");
      } else {
        setError("회원가입에 실패했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col items-center justify-center w-full max-w-sm mx-auto"
    >
      <div className="w-full relative">
        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => {
            const newEmail = e.target.value;
            setEmail(newEmail);
            if (emailRegex.test(newEmail)) {
              setEmailError("");
            }
          }}
          className={`input ${
            email && emailRegex.test(email) ? "input-success" : "input-bordered"
          } w-full`}
        />
        {emailError && (
          <span className="absolute left-0 top-full mt-1 text-xs text-red-500 whitespace-normal w-full">
            {emailError}
          </span>
        )}
      </div>

      <div className="w-full relative mt-8">
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => {
            const newPassword = e.target.value;
            setPassword(newPassword);
            if (passwordRegex.test(newPassword)) {
              setPasswordError("");
            }
          }}
          className={`input ${
            password && passwordRegex.test(password)
              ? "input-success"
              : "input-bordered"
          } w-full`}
        />
        {passwordError && (
          <span className="absolute left-0 top-full mt-1 text-xs text-red-500 whitespace-normal w-full">
            {passwordError}
          </span>
        )}
      </div>

      <div className="w-full relative mt-8">
        <input
          type="password"
          placeholder="비밀번호 확인"
          value={passwordConfirm}
          onChange={(e) => {
            const confirmPass = e.target.value;
            setPasswordConfirm(confirmPass);
            if (password === confirmPass) {
              setPasswordConfirmError("");
            }
          }}
          className={`input ${
            passwordConfirm && password === passwordConfirm
              ? "input-success"
              : "input-bordered"
          } w-full`}
        />
        {passwordConfirmError && (
          <span className="absolute left-0 top-full mt-1 text-xs text-red-500 whitespace-normal w-full">
            {passwordConfirmError}
          </span>
        )}
      </div>

      {error && (
        <span className="mt-1 text-xs text-red-500 whitespace-normal w-full">
          {error}
        </span>
      )}

      <div className="form-control mt-14 w-full">
        <button
          type="submit"
          className={`btn btn-primary ${
            loading ? "disabled" : ""
          } btn-wide no-animation`}
        >
          {loading ? "회원가입 중..." : "회원가입"}
        </button>
      </div>
    </form>
  );
}

export default RegisterForm;
