import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import userDetailService, {
  UserDetailPostRequest,
} from "../../services/userDetailService";
import authService from "../../services/authService";

function UserOnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [knowsFTP, setKnowsFTP] = useState(true);
  const [isNicknameValid, setIsNicknameValid] = useState<boolean | null>(null);
  const [isCheckingNickname, setIsCheckingNickname] = useState(false);
  const [nicknameErrorMessage, setNicknameErrorMessage] = useState("");
  const [initialNickname, setInitialNickname] = useState("");
  const [userData, setUserData] = useState<UserDetailPostRequest>({
    userNickname: "",
    gender: "",
    birthDate: "",
    phoneNumber: "",
    fullName: "",
    bio: "",
    activityTime: [],
    activityDay: [],
    activityLocation: [],
    bikeType: [],
    level: "",
    FTP: 0,
    height: 0,
    weight: 0,
    tags: [],
  });

  useEffect(() => {
    const fetchNickname = async () => {
      const nickname = await authService.getNickname();
      setUserData((prev) => ({ ...prev, userNickname: nickname }));
      setInitialNickname(nickname);
      if (nickname && nickname.trim()) {
        setIsNicknameValid(true);
      }
    };
    fetchNickname();
  }, []);

  // Create helper functions to handle step transitions
  const goToNextStep = () => {
    if (step === 1) {
      if (!userData.userNickname.trim()) {
        setIsNicknameValid(false);
        setNicknameErrorMessage("닉네임은 필수 입력 항목입니다.");
        return;
      }

      if (
        userData.userNickname !== initialNickname &&
        isNicknameValid !== true
      ) {
        return;
      }
    }

    if (step < 5) {
      setStep((prevStep) => {
        const nextStep = prevStep + 1;
        return nextStep as 1 | 2 | 3 | 4 | 5;
      });
    }
  };

  const goToPreviousStep = () => {
    if (step > 1) {
      setStep((prevStep) => {
        const nextStep = prevStep - 1;
        return nextStep as 1 | 2 | 3 | 4 | 5;
      });
    }
  };

  // 상태 업데이트 핸들러
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));

    if (name === "userNickname") {
      if (value !== initialNickname) {
        debouncedValidateNickname(value);
      } else {
        setIsNicknameValid(true);
        setNicknameErrorMessage("");
      }
    }
  };

  // 숫자 타입 입력 처리
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: Number(value) }));
  };

  // 활동 시간대 토글
  const toggleActivityTime = (time: string) => {
    setUserData((prev) => ({
      ...prev,
      activityTime: prev.activityTime.includes(time)
        ? prev.activityTime.filter((t) => t !== time)
        : [...prev.activityTime, time],
    }));
  };

  // 활동 요일 토글
  const toggleActivityDay = (day: string) => {
    setUserData((prev) => ({
      ...prev,
      activityDay: prev.activityDay.includes(day)
        ? prev.activityDay.filter((d) => d !== day)
        : [...prev.activityDay, day],
    }));
  };

  // 제출 함수
  const handleSubmit = async () => {
    try {
      await userDetailService.registerUserDetail(userData);
      navigate("/"); // 온보딩 완료 후 메인 페이지로 이동
    } catch (error) {
      console.error("Failed to register user details:", error);
      alert("등록에 실패했습니다. 다시 시도해주세요.");
    }
  };

  // 건너뛰기 함수
  const handleSkip = () => {
    navigate("/"); // 메인 페이지로 이동
  };

  // Add a debounce function to avoid too many API calls
  const debounce = (func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };

  // Nickname validation function
  const validateNickname = async (nickname: string) => {
    if (!nickname.trim()) {
      setIsNicknameValid(null);
      setNicknameErrorMessage("");
      return;
    }

    if (nickname === initialNickname) {
      setIsNicknameValid(true);
      setNicknameErrorMessage("");
      return;
    }

    if (nickname.length < 2) {
      setIsNicknameValid(false);
      setNicknameErrorMessage("닉네임은 최소 2자 이상이어야 합니다.");
      return;
    }

    try {
      setIsCheckingNickname(true);
      const isAvailable = await authService.checkNickname(nickname);
      setIsNicknameValid(isAvailable);
      setNicknameErrorMessage(
        isAvailable ? "" : "이미 사용 중인 닉네임입니다."
      );
    } catch (error) {
      console.error("닉네임 중복 확인 중 오류 발생:", error);
      setIsNicknameValid(false);
      setNicknameErrorMessage("닉네임 중복 확인 중 오류가 발생했습니다.");
    } finally {
      setIsCheckingNickname(false);
    }
  };

  // Debounced version of nickname validation
  const debouncedValidateNickname = debounce(validateNickname, 500);

  return (
    <div className="flex flex-col items-center justify-center max-w-screen-sm mx-auto gap-4 p-4">
      <ul className="steps w-full mb-8">
        <li className={`step ${step >= 1 ? "step-primary" : ""}`}>계정 정보</li>
        <li className={`step ${step >= 2 ? "step-primary" : ""}`}>개인 정보</li>
        <li className={`step ${step >= 3 ? "step-primary" : ""}`}>신체 정보</li>
        <li className={`step ${step >= 4 ? "step-primary" : ""}`}>
          라이딩 정보
        </li>
        <li className={`step ${step >= 5 ? "step-primary" : ""}`}>활동 정보</li>
      </ul>

      {step === 1 && (
        <div className="w-full flex flex-col gap-4">
          <div className="text-2xl font-bold">계정 정보</div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">닉네임</span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="userNickname"
                value={userData.userNickname}
                onChange={handleChange}
                placeholder="닉네임을 입력하세요"
                className={`input input-ghost w-full input-bordered ${
                  isNicknameValid === false
                    ? "input-error"
                    : isNicknameValid === true
                    ? "input-success"
                    : ""
                }`}
              />
              {isCheckingNickname && (
                <span className="loading loading-spinner loading-xs absolute right-3 top-1/2 transform -translate-y-1/2"></span>
              )}
              {isNicknameValid === true && (
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-success">
                  ✓
                </span>
              )}
            </div>
            {nicknameErrorMessage && (
              <label className="label">
                <span className="label-text-alt text-error">
                  {nicknameErrorMessage}
                </span>
              </label>
            )}
            {isNicknameValid === true && (
              <label className="label">
                <span className="label-text-alt text-success">
                  사용 가능한 닉네임입니다.
                </span>
              </label>
            )}
          </div>

          <div className="flex justify-between mt-4">
            <div className="btn btn-outline" onClick={handleSkip}>
              건너뛰기
            </div>
            <div className="btn btn-primary" onClick={goToNextStep}>
              다음
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="w-full flex flex-col gap-4">
          <div className="text-2xl font-bold">개인 정보</div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">이름</span>
            </label>
            <input
              type="text"
              name="fullName"
              value={userData.fullName}
              onChange={handleChange}
              placeholder="이름을 입력하세요"
              className="input input-ghost w-full input-bordered"
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">성별</span>
            </label>
            <div className="flex gap-2">
              {["남자", "여자", "그외"].map((genderOption) => (
                <div
                  key={genderOption}
                  className={`badge badge-lg p-4 cursor-pointer ${
                    userData.gender === genderOption
                      ? "badge-primary"
                      : "badge-outline"
                  }`}
                  onClick={() =>
                    setUserData((prev) => ({ ...prev, gender: genderOption }))
                  }
                >
                  {genderOption}
                </div>
              ))}
            </div>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">전화번호</span>
            </label>
            <input
              type="tel"
              name="phoneNumber"
              value={userData.phoneNumber}
              onChange={handleChange}
              placeholder="010-0000-0000"
              className="input input-ghost w-full input-bordered"
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">생년월일</span>
            </label>
            <input
              type="date"
              name="birthDate"
              value={userData.birthDate}
              onChange={handleChange}
              className="input input-ghost w-full input-bordered"
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">자기소개</span>
            </label>
            <textarea
              name="bio"
              value={userData.bio}
              onChange={handleChange}
              placeholder="간단한 자기소개를 입력하세요"
              className="textarea textarea-bordered h-24"
            />
          </div>

          <div className="flex justify-between mt-4">
            <div className="btn btn-outline" onClick={goToPreviousStep}>
              이전
            </div>
            <div className="btn btn-outline" onClick={handleSkip}>
              건너뛰기
            </div>
            <div className="btn btn-primary" onClick={goToNextStep}>
              다음
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="w-full flex flex-col gap-4">
          <div className="text-2xl font-bold">신체 정보</div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">신장 (cm)</span>
            </label>
            <input
              type="number"
              name="height"
              value={userData.height || ""}
              onChange={handleNumberChange}
              placeholder="키를 입력하세요"
              className="input input-ghost w-full input-bordered"
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">체중 (kg)</span>
            </label>
            <input
              type="number"
              name="weight"
              value={userData.weight || ""}
              onChange={handleNumberChange}
              placeholder="체중을 입력하세요"
              className="input input-ghost w-full input-bordered"
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">
                FTP (Functional Threshold Power)
              </span>
            </label>

            <div className="flex gap-4 mb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  className="radio radio-primary"
                  checked={knowsFTP}
                  onChange={() => {
                    setKnowsFTP(true);
                  }}
                />
                <span>알고 있어요</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  className="radio radio-primary"
                  checked={!knowsFTP}
                  onChange={() => {
                    setKnowsFTP(false);
                    setUserData((prev) => ({ ...prev, FTP: 0 }));
                  }}
                />
                <span>모르겠어요</span>
              </label>
            </div>

            {knowsFTP && (
              <input
                type="number"
                name="FTP"
                value={userData.FTP || ""}
                onChange={handleNumberChange}
                placeholder="FTP를 입력하세요"
                className="input input-ghost w-full input-bordered"
              />
            )}
          </div>

          <div className="flex justify-between mt-4">
            <div className="btn btn-outline" onClick={goToPreviousStep}>
              이전
            </div>
            <div className="btn btn-outline" onClick={handleSkip}>
              건너뛰기
            </div>
            <div className="btn btn-primary" onClick={goToNextStep}>
              다음
            </div>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="w-full flex flex-col gap-4">
          <div className="text-2xl font-bold">라이딩 정보</div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">라이딩 레벨</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {["무경력", "초보자", "입문자", "중수", "고수"].map(
                (levelOption) => (
                  <div
                    key={levelOption}
                    className={`badge badge-lg p-4 cursor-pointer ${
                      userData.level === levelOption
                        ? "badge-primary"
                        : "badge-outline"
                    }`}
                    onClick={() =>
                      setUserData((prev) => ({ ...prev, level: levelOption }))
                    }
                  >
                    {levelOption}
                  </div>
                )
              )}
            </div>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">자전거 종류</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {["로드", "따릉이", "하이브리드", "자유"].map((type) => (
                <div
                  key={type}
                  className={`badge badge-lg p-4 cursor-pointer ${
                    userData.bikeType.includes(type)
                      ? "badge-primary"
                      : "badge-outline"
                  }`}
                  onClick={() => {
                    setUserData((prev) => ({
                      ...prev,
                      bikeType: prev.bikeType.includes(type)
                        ? prev.bikeType.filter((t) => t !== type)
                        : [...prev.bikeType, type],
                    }));
                  }}
                >
                  {type}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between mt-4">
            <div className="btn btn-outline" onClick={goToPreviousStep}>
              이전
            </div>
            <div className="btn btn-outline" onClick={handleSkip}>
              건너뛰기
            </div>
            <div className="btn btn-primary" onClick={goToNextStep}>
              다음
            </div>
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="w-full flex flex-col gap-4">
          <div className="text-2xl font-bold">활동 정보</div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">선호 활동 시간</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {["오전", "오후", "저녁"].map((time) => (
                <div
                  key={time}
                  className={`badge badge-lg p-4 cursor-pointer ${
                    userData.activityTime.includes(time)
                      ? "badge-primary"
                      : "badge-outline"
                  }`}
                  onClick={() => toggleActivityTime(time)}
                >
                  {time}
                </div>
              ))}
            </div>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">선호 활동 요일</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {["월", "화", "수", "목", "금", "토", "일"].map((day) => (
                <div
                  key={day}
                  className={`badge badge-lg p-4 cursor-pointer ${
                    userData.activityDay.includes(day)
                      ? "badge-primary"
                      : "badge-outline"
                  }`}
                  onClick={() => toggleActivityDay(day)}
                >
                  {day}
                </div>
              ))}
            </div>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">활동 지역</span>
            </label>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {[
                "서울",
                "경기",
                "인천",
                "부산",
                "대구",
                "광주",
                "대전",
                "울산",
                "경상북도",
                "경상남도",
                "전라북도",
                "전라남도",
                "충청북도",
                "충청남도",
                "강원도",
                "제주도",
              ].map((location) => (
                <div
                  key={location}
                  className={`badge badge-lg p-4 cursor-pointer ${
                    userData.activityLocation.includes(location)
                      ? "badge-primary"
                      : "badge-outline"
                  }`}
                  onClick={() => {
                    setUserData((prev) => ({
                      ...prev,
                      activityLocation: prev.activityLocation.includes(location)
                        ? prev.activityLocation.filter(
                            (loc) => loc !== location
                          )
                        : [...prev.activityLocation, location],
                    }));
                  }}
                >
                  {location}
                </div>
              ))}
            </div>
          </div>

          <div className="alert alert-info mt-4">
            <div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="stroke-current flex-shrink-0 w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <span>
                모든 정보가 입력되었습니다. 제출하여 가입을 완료하세요!
              </span>
            </div>
          </div>

          <div className="flex justify-between mt-4">
            <div className="btn btn-outline" onClick={goToPreviousStep}>
              이전
            </div>
            <div className="btn btn-primary" onClick={handleSubmit}>
              가입 완료
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserOnboardingPage;
