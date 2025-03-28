import { useState } from "react";
import authService from "../services/authService";
import { useNavigate } from "react-router";

function UserUpdateForm() {
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [passwordConfirm, setPasswordConfirm] = useState<string>("");

  const [currentPasswordError, setCurrentPasswordError] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");
  const [passwordConfirmError, setPasswordConfirmError] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  // 인풋 터치 여부
  const [currentPasswordTouched, setCurrentPasswordTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [passwordConfirmTouched, setPasswordConfirmTouched] = useState(false);

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  // 정규식 검증
  const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[0-9]).{8,25}$/;

  const currentPasswordInputClass = `input input-bordered w-full flex items-center gap-2 ${
    error
      ? "input-error"
      : currentPasswordTouched && currentPassword.length > 0
      ? "input"
      : currentPasswordTouched && currentPassword.length === 0
      ? "input-error"
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

  // 계정 정보 업데이트 처리
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 기존 메시지 초기화
    setCurrentPasswordError("");
    setPasswordError("");
    setPasswordConfirmError("");
    setError("");
    setSuccessMessage("");

    // 현재 비밀번호 검증
    if (currentPassword.length === 0) {
      setCurrentPasswordError("현재 비밀번호를 입력해주세요!");
      return;
    }

    // 클라이언트 검증
    if (password.length > 0) {
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
    } else if (passwordConfirm.length > 0) {
      setPasswordError("비밀번호를 입력해주세요!");
      return;
    }

    // 변경할 내용이 없으면 알림
    if (password.length === 0) {
      setError("변경할 정보를 입력해주세요.");
      return;
    }

    const payload = {
      currentPassword,
      password,
    };

    try {
      setLoading(true);
      await authService.updateUserAuthInfo(payload);
      navigate("/user/me/account");
    } catch (err: any) {
      console.error(err);
      setError("비밀번호 변경에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col items-center justify-center max-w-sm mx-auto relative w-[20rem]"
    >
      <label
        className="label text-sm text-gray-500 mr-auto"
        htmlFor="currentPassword"
      >
        현재 비밀번호
      </label>
      <label className={currentPasswordInputClass}>
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
          id="currentPassword"
          type="password"
          placeholder="현재 비밀번호"
          value={currentPassword}
          onChange={(e) => {
            setCurrentPassword(e.target.value);
            if (currentPasswordError && e.target.value.length > 0) {
              setCurrentPasswordError("");
            }
          }}
          onBlur={() => {
            setCurrentPasswordTouched(true);
            if (currentPassword.length === 0) {
              setCurrentPasswordError("현재 비밀번호를 입력해주세요!");
            } else {
              setCurrentPasswordError("");
            }
          }}
          className="w-full"
        />
      </label>
      {currentPasswordError && (
        <span className="mt-2 text-sm text-red-400 text-left w-full">
          {currentPasswordError}
        </span>
      )}

      <label
        className="label text-sm text-gray-500 mt-4 mr-auto"
        htmlFor="password"
      >
        새 비밀번호
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
          placeholder="새 비밀번호"
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
        새 비밀번호 확인
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
          placeholder="새 비밀번호 확인"
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

      {successMessage && (
        <span className="mt-2 text-sm text-green-500 text-left w-full">
          {successMessage}
        </span>
      )}

      <button
        type="submit"
        disabled={loading}
        className={`btn btn-primary btn-soft w-[20rem] ${
          loading ? "disabled" : ""
        } no-animation mt-10`}
      >
        {loading ? "업데이트 중..." : "비밀번호 변경"}
      </button>
    </form>
  );
}

export default UserUpdateForm;
