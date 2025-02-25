import { useState } from "react";
import authService, {
  LoginRequest,
  LoginResponse,
} from "../services/authService";
import { useAuthStore } from "../stores/useAuthStore";
import { useNavigate } from "react-router";

function LoginForm() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");
  const [error, setError] = useState<string>("");
  const { setUser } = useAuthStore();
  const navigate = useNavigate();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[0-9]).{8,25}$/;
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

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

    const payload: LoginRequest = {
      email,
      password,
    };
    try {
      setLoading(true);
      const response: LoginResponse = await authService.login(payload);
      console.log(response);
      setUser({ email: response.userEmail, userId: response.userId });
      navigate("/");
    } catch (error) {
      setError("이메일 또는 비밀번호를 다시 확인해 주세요!");
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

      {error && (
        <span className="mt-1 text-xs text-red-500 whitespace-normal w-full">
          {error}
        </span>
      )}

      <div className="form-control mt-14">
        <button
          type="submit"
          className={`btn btn-primary ${
            loading ? "disabled" : ""
          } btn-wide no-animation`}
        >
          {loading ? "로그인 중..." : "로그인"}
        </button>
      </div>
    </form>
  );
}

export default LoginForm;
