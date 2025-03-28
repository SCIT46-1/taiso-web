import userDetailService, {
  UserPageDetailResponse,
  UserPageDetailRequest,
} from "../services/userDetailService";
import { useEffect, useState } from "react";
import { useAuthStore } from "../stores/useAuthStore";
import ReviewList from "../components/ReviewList";
import { useParams, useNavigate } from "react-router";
import bookmarkService from "../services/bookmarkService";

// 태그 정의
const GENDER_OPTIONS = ["남자", "여자", "그외"];
const LEVEL_OPTIONS = ["무경력", "초보자", "입문자", "중수", "고수"];
const ACTIVITYTIME_OPTION = ["오전", "오후", "저녁", "밤", "종일"];
const ACTIVITYDAY_OPTION = ["월", "화", "수", "목", "금", "토", "일"];
const ACTIVITYLOCATION_OPTION = [
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
  "전라남도",
  "전라북도",
  "충청남도",
  "충청북도",
  "강원도",
  "제주도",
];

// 태그 통합
const categories = [
  { title: "활동 시간", options: ACTIVITYTIME_OPTION, key: "activityTime" },
  { title: "활동 요일", options: ACTIVITYDAY_OPTION, key: "activityDay" },
  {
    title: "활동 지역",
    options: ACTIVITYLOCATION_OPTION,
    key: "activityLocation",
  },
  { title: "성별", options: GENDER_OPTIONS, key: "gender" },
  { title: "레벨", options: LEVEL_OPTIONS, key: "level" },
];

// 모달
interface ModalProps {
  id: string;
  title: string;
  children: React.ReactNode;
  actions: React.ReactNode;
}

// 모달 구조 설정
export function Modal({ id, title, children, actions }: ModalProps) {
  return (
    <dialog id={id} className="modal modal-bottom sm:modal-middle">
      <div className="modal-box">
        <h3 className="font-bold text-lg">{title}</h3>
        <div className="py-4">{children}</div>
        <div className="modal-action">{actions}</div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}

function UserDetailPage() {
  const { userId } = useParams();
  const [userDetail, setUserDetail] = useState<UserPageDetailResponse | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  console.log(isLoading, user);

  // 데이터 관리
  const [nickName, setNickName] = useState<string>("");
  const [bio, setBio] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [level, setLevel] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
  const [profileImg, setProfileImg] = useState<string | null>("");
  const [backgroundImg, setBackgroundImg] = useState<string | null>("");
  const [profileImgPatch, setProfileImgPatch] = useState<File | null>();
  const [backgroundImgPatch, setBackgroundImgPatch] = useState<File | null>();

  // 이미지 미리보기용 상태 추가
  const [profileImgPreview, setProfileImgPreview] = useState<string | null>(
    null
  );
  const [backgroundImgPreview, setBackgroundImgPreview] = useState<
    string | null
  >(null);

  // 북마크 상태 관리를 위한 state 추가
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    const fetchUserDetail = async () => {
      setIsLoading(true);
      try {
        const userDetailData = await userDetailService.getUserPageDetail(
          Number(userId)
        );

        if (userDetailData) {
          setUserDetail(userDetailData);
          setNickName(userDetailData.userNickname || "");
          setProfileImg(userDetailData.profileImg || ""); // 기존 S3 URL
          setBackgroundImg(userDetailData.backgroundImg || "");
          setBio(userDetailData.bio || "");
          setGender(userDetailData.gender || "");
          setLevel(userDetailData.level || "");
          setTags(userDetailData.tags || []);

          // 북마크 상태 설정 (API에서 이 정보를 제공한다고 가정)
          // 만약 API에서 제공하지 않는다면, 별도의 API 호출로 북마크 상태를 확인해야 함
          setIsBookmarked(userDetailData.bookmarked || false);
        } else {
          setUserDetail(null);
        }
      } catch (error) {
        console.error("데이터 로딩 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserDetail();
  }, [userId]);

  // 파일 업로드 핸들러
  const handleProfileImgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImgPatch(file); // 새 파일로 업데이트

      // 미리보기 URL 생성
      const previewUrl = URL.createObjectURL(file);
      setProfileImgPreview(previewUrl);
    }
  };

  const handleBackgroundImgChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setBackgroundImgPatch(file);

      // 미리보기 URL 생성
      const previewUrl = URL.createObjectURL(file);
      setBackgroundImgPreview(previewUrl);
    }
  };

  // 파일 업로드 취소 핸들러 추가
  const resetProfileImg = () => {
    setProfileImgPatch(null);
    setProfileImgPreview(null);
  };

  const resetBackgroundImg = () => {
    setBackgroundImgPatch(null);
    setBackgroundImgPreview(null);
  };

  // 태그 선택 처리 함수 추가
  const handleTagSelection = (key: string, option: string) => {
    switch (key) {
      case "gender":
        // 성별은 하나만 선택 가능 (선택한 것과 같다면 선택 해제)
        setGender(gender === option ? "" : option);
        break;
      case "level":
        // 레벨도 하나만 선택 가능 (선택한 것과 같다면 선택 해제)
        setLevel(level === option ? "" : option);
        break;
      default:
        // 기존 태그 선택 로직
        setTags((prevTags) =>
          prevTags.includes(option)
            ? prevTags.filter((tag) => tag !== option)
            : [...prevTags, option]
        );
        break;
    }
  };

  const handleSubmit = async () => {
    const userIdNumber = Number(userId);

    // userProfileRequest 객체 생성 (파일을 제외한 데이터만)
    const userProfileRequest: UserPageDetailRequest = {
      userId: userIdNumber,
      userNickname: nickName,
      bio: bio,
      gender: gender, // 선택하지 않았을로 전송
      level: level, // 선택하 경우 null로 전송
      tags: tags,
    };

    try {
      setIsLoading(true);
      await userDetailService.patchUserPageDetail(
        userProfileRequest,
        profileImgPatch,
        backgroundImgPatch
      );

      // 성공 후 이미지 미리보기 및 파일 상태 정리
      setProfileImgPreview(null);
      setBackgroundImgPreview(null);

      // 최신 데이터로 페이지 갱신
      const userDetailData = await userDetailService.getUserPageDetail(
        Number(userId)
      );

      if (userDetailData) {
        setUserDetail(userDetailData);
        setProfileImg(userDetailData.profileImg || "");
        setBackgroundImg(userDetailData.backgroundImg || "");
      }

      setIsLoading(false);

      // 편집 모달 닫은 후 약간의 지연을 준 다음 성공 모달을 표시
      closeModal("profile-edit-modal");
      setTimeout(() => {
        showModal("profile-update-success-modal");
      }, 100);

      // 모달 닫기는 성공 모달의 확인 버튼에서 처리
    } catch (error) {
      console.error("Failed to submit:", error);
      setIsLoading(false);

      // 실패 시 에러 모달 보여주기
      showModal("profile-update-error-modal");
    }
  };

  // 북마크 토글 핸들러 추가
  const handleBookmarkToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      if (!isBookmarked) {
        await bookmarkService.bookmarkUser(Number(userId));
      } else {
        await bookmarkService.deleteBookmarkUser(Number(userId));
      }

      // 북마크 상태 업데이트
      setIsBookmarked(!isBookmarked);
    } catch (error) {
      console.error("Bookmark operation failed:", error);

      // 401 에러 체크 (인증 실패)
      if (
        error instanceof Error &&
        "response" in (error as any) &&
        (error as any).response?.status === 401
      ) {
        navigate("/auth/landing");
      }
    }
  };

  // 로딩 중일 때 처리
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  // 모달 동작
  // 버튼에서 onClick으로 동작
  const closeModal = (id: string) => {
    const modal = document.getElementById(id) as HTMLDialogElement | null;
    if (modal) {
      modal.close();
    } else {
      console.error(`Modal element with id ${id} not found`);
    }
  };

  const showModal = (id: string) => {
    console.log(`Showing modal: ${id}`); // 디버깅용 로그
    const modal = document.getElementById(id) as HTMLDialogElement | null;
    if (modal) {
      modal.showModal();
    } else {
      console.error(`Modal element with id ${id} not found`);
    }
  };

  return (
    <div className="md:w-full max-w-screen-md rounded-xl w-[90%] mt-2 border-base-300 border-[1px] shadow-xl">
      {/* 배경이미지 & 프로필 이미지 */}
      <div className="flex flex-col relative">
        <img
          src={
            userDetail?.backgroundImg !== null
              ? `https://taiso-web-gpx-file-space-korea.s3.ap-northeast-2.amazonaws.com/${userDetail?.backgroundImg}`
              : "/backgroundDefault.png"
          }
          alt="background"
          className="w-full h-64  object-cover rounded-t-xl"
        />
        <img
          src={
            userDetail?.profileImg !== null
              ? `https://taiso-web-gpx-file-space-korea.s3.ap-northeast-2.amazonaws.com/${userDetail?.profileImg}`
              : "/userDefault.png"
          }
          alt="profile"
          className="size-24 rounded-full absolute -bottom-12 sm:left-14 left-6"
        />

        {/* 북마크 아이콘 (자신의 프로필이 아닐 경우에만 표시) */}
        {user?.userId !== Number(userId) && (
          <div className="absolute top-4 right-4">
            {!isBookmarked ? (
              <svg
                data-slot="icon"
                fill="none"
                strokeWidth="1.75"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                className="size-7 text-white cursor-pointer hover:text-gray-200"
                onClick={handleBookmarkToggle}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"
                ></path>
              </svg>
            ) : (
              <svg
                data-slot="icon"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                className="size-7 text-white cursor-pointer hover:text-gray-200"
                onClick={handleBookmarkToggle}
              >
                <path
                  clipRule="evenodd"
                  fillRule="evenodd"
                  d="M10 2c-1.716 0-3.408.106-5.07.31C3.806 2.45 3 3.414 3 4.517V17.25a.75.75 0 0 0 1.075.676L10 15.082l5.925 2.844A.75.75 0 0 0 17 17.25V4.517c0-1.103-.806-2.068-1.93-2.207A41.403 41.403 0 0 0 10 2Z"
                ></path>
              </svg>
            )}
          </div>
        )}
      </div>
      {/* 회원 정보 */}
      <div className="flex flex-col sm:ml-12 ml-6 mt-14 w-[85%] p-2">
        <div className="flex gap-2 mb-2 flex-col">
          <div className="text-2xl font-bold ml-2">
            {userDetail?.userNickname}

            {/* 페이지 편집버튼 */}
            {user?.userId == userDetail?.userId && (
              <button
                className="badge badge-outline badge-error ml-2"
                onClick={() => showModal("profile-edit-modal")}
              >
                edit
              </button>
            )}
          </div>
          <div className="ml-2">
            {userDetail?.level && (
              <div className="badge badge-primary badge-outline mr-1">
                {userDetail?.level}
              </div>
            )}
            {userDetail?.gender && (
              <div className="badge badge-primary badge-outline mr-1">
                {userDetail?.gender}
              </div>
            )}
            {(userDetail?.tags ?? []).map((tag) => (
              <div key={tag} className="badge badge-primary badge-outline mr-1">
                {tag}
              </div>
            ))}
          </div>
        </div>

        {/* 바이오 */}
        <div
          tabIndex={0}
          className="collapse collapse-open bg-gray-100 border mb-6"
        >
          <div className="collapse-content text-sm m-4">{userDetail?.bio}</div>
        </div>
      </div>
      {/* 통계 */}
      <div className="border bg-gray-100 flex flex-col items-center justify-center">
        <div className="stats shadow flex justify-center first:before:w-fit m-2 gap-2 w-[85%]">
          <div className="stat">
            <div className="stat-figure text-primary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="inline-block h-8 w-8 stroke-current"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                ></path>
              </svg>
            </div>
            <div className="stat-title">참여 번개</div>
            <div className="stat-value text-primary text-lg">
              {userDetail?.userLightningsCount}
            </div>
          </div>
          <div className="stat">
            <div className="stat-figure">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="inline-block h-8 w-8 stroke-current"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                ></path>
              </svg>
            </div>
            <div className="stat-title">가입 클럽</div>
            <div className="stat-value text-lg">
              {userDetail?.userClubsCount}
            </div>
          </div>
          <div className="stat">
            <div className="stat-figure">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="inline-block h-8 w-8 stroke-current"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                ></path>
              </svg>
            </div>
            <div className="stat-title">등록 루트</div>
            <div className="stat-value text-lg">
              {userDetail?.userRegisteredRoutesCount}
            </div>
          </div>
        </div>
      </div>
      {/* 스트라바 통계 */}
      <div className="mt-8 mb-8 overflow-hidden shadow-lg">
        {/* 스트라바 헤더 */}
        <div className="bg-gradient-to-r from-[#fc4d02dc] to-[#ff8250a6] p-4 flex items-center justify-between">
          <div className="flex items-center">
            <svg
              viewBox="0 0 24 24"
              className="h-8 w-8 mr-2 text-white"
              fill="currentColor"
            >
              <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
            </svg>
            <h2 className="text-2xl font-bold text-white tracking-wide">
              STRAVA
            </h2>
          </div>
          {userDetail?.stravaConnected && (
            <div className="bg-white text-[#FC4C02] text-xs font-semibold px-2 py-1 rounded-full">
              연결됨
            </div>
          )}
        </div>

        {/* 스트라바 컨텐츠 */}
        <div className="bg-white p-4">
          {!userDetail?.stravaConnected ? (
            <div className="flex flex-col items-center py-6 text-center">
              <p className="text-gray-600 mb-4">
                아직 스트라바를 연동하지 않았습니다.
              </p>
              {user?.userId == userDetail?.userId && (
                <button className="btn btn-sm bg-[#FC4C02] hover:bg-[#E34402] text-white border-none">
                  스트라바 연결하기
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {/* 주행 횟수 */}
              <div className="flex flex-col items-center justify-center bg-gray-50 p-4 rounded-xl transition-shadow">
                <div className="bg-[#FFEEE8] p-2 rounded-full mb-2">
                  <svg
                    className="h-5 w-5 text-[#FC4C02]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <div className="text-sm text-gray-500 font-medium">
                  주행 횟수
                </div>
                <div className="text-xl font-bold text-gray-800">
                  {userDetail?.userStravaDataCount || 0}
                  <span className="text-xs text-gray-500 ml-1">회</span>
                </div>
              </div>

              {/* 주행 거리 */}
              <div className="flex flex-col items-center justify-center bg-gray-50 p-4 rounded-xl transition-shadow">
                <div className="bg-[#FFEEE8] p-2 rounded-full mb-2">
                  <svg
                    className="h-5 w-5 text-[#FC4C02]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                </div>
                <div className="text-sm text-gray-500 font-medium">
                  주행 거리
                </div>
                <div className="text-xl font-bold text-gray-800">
                  {typeof userDetail?.userStravaKm === "number"
                    ? userDetail.userStravaKm.toFixed(2)
                    : "0.00"}
                  <span className="text-xs text-gray-500 ml-1">km</span>
                </div>
              </div>

              {/* 획득 고도 */}
              <div className="flex flex-col items-center justify-center bg-gray-50 p-4 rounded-xl transition-shadow">
                <div className="bg-[#FFEEE8] p-2 rounded-full mb-2">
                  <svg
                    className="h-5 w-5 text-[#FC4C02]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 11l3-3m0 0l3 3m-3-3v8m0-13a9 9 0 110 18 9 9 0 010-18z"
                    />
                  </svg>
                </div>
                <div className="text-sm text-gray-500 font-medium">
                  획득 고도
                </div>
                <div className="text-xl font-bold text-gray-800">
                  {userDetail?.userStravaElevation || 0}
                  <span className="text-xs text-gray-500 ml-1">m</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* 리뷰 */}
      <div className="mb-4 justify-center flex">
        <ReviewList userId={Number(userId)} />
      </div>
      <div className="h-24"></div>
      {/* 모달 컴포넌트들 */}
      <Modal
        id="profile-edit-modal"
        title="Profile Edit"
        actions={
          <>
            <button
              type="submit"
              disabled={isLoading}
              onClick={handleSubmit}
              className="btn btn-primary"
            >
              {isLoading ? "업데이트 중..." : "프로필 변경"}
            </button>
            <button
              className="btn"
              onClick={() => closeModal("profile-edit-modal")}
            >
              취소
            </button>
          </>
        }
      >
        <form className="flex flex-col items-center justify-center max-w-sm mx-auto relative w-[20rem]">
          {/* 닉네임 */}
          <label
            className="label text-sm text-gray-500 mr-auto"
            htmlFor="nickName"
          >
            닉네임
          </label>
          <input
            id="nickName"
            type="text"
            placeholder="닉네임"
            value={nickName}
            onChange={(e) => setNickName(e.target.value)}
            className="input input-bordered w-full"
          />

          {/* 자기소개 */}
          <label
            className="label text-sm text-gray-500 mt-4 mr-auto"
            htmlFor="bio"
          >
            자기소개
          </label>
          <textarea
            id="bio"
            placeholder="자기소개를 입력하세요."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="textarea textarea-bordered w-full"
          ></textarea>

          {/* 프로필 이미지 */}
          <div className="w-full mt-4">
            <label className="block text-sm text-gray-500 mb-2">
              프로필 이미지
            </label>
            <div className="flex flex-col gap-2">
              {/* 이미지 미리보기 */}
              {(profileImgPreview || profileImg) && (
                <div className="relative w-24 h-24 mx-auto">
                  <img
                    src={profileImgPreview || profileImg || ""}
                    alt="프로필 미리보기"
                    className="size-24 rounded-full object-cover"
                  />
                  {profileImgPreview && (
                    <button
                      type="button"
                      onClick={resetProfileImg}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full size-6 flex items-center justify-center"
                    >
                      ×
                    </button>
                  )}
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleProfileImgChange}
                className="file-input file-input-bordered w-full"
              />
            </div>
          </div>

          {/* 배경화면 이미지 */}
          <div className="w-full mt-4">
            <label className="block text-sm text-gray-500 mb-2">
              배경화면 이미지
            </label>
            <div className="flex flex-col gap-2">
              {/* 이미지 미리보기 */}
              {(backgroundImgPreview || backgroundImg) && (
                <div className="relative w-full h-32">
                  <img
                    src={backgroundImgPreview || backgroundImg || ""}
                    alt="배경 미리보기"
                    className="w-full h-32 rounded-lg object-cover"
                  />
                  {backgroundImgPreview && (
                    <button
                      type="button"
                      onClick={resetBackgroundImg}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full size-6 flex items-center justify-center"
                    >
                      ×
                    </button>
                  )}
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleBackgroundImgChange}
                className="file-input file-input-bordered w-full"
              />
            </div>
          </div>

          {/* 태그 선택 */}
          <div className="mt-4">
            {categories.map(({ title, options, key }) => (
              <div key={key} className="mb-4">
                <p className="text-sm font-semibold text-gray-600">{title}</p>
                <div className="flex gap-2 flex-wrap">
                  {options.map((option) => {
                    // 선택 상태 확인
                    let isSelected = false;
                    if (key === "gender") {
                      isSelected = gender === option;
                    } else if (key === "level") {
                      isSelected = level === option;
                    } else {
                      isSelected = tags.includes(option);
                    }

                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => handleTagSelection(key, option)}
                        className={`btn md:btn-sm btn-xs my-1 btn-outline text-gray-400 rounded-full border-1 hover:bg-primary hover:border-primary 
                          ${isSelected ? "btn-primary" : "btn-outline"}`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </form>
      </Modal>

      {/* 성공 모달 추가 */}
      <Modal
        id="profile-update-success-modal"
        title="업데이트 성공"
        actions={
          <button
            className="btn btn-primary"
            onClick={() => {
              console.log("Closing modals"); // 디버깅용 로그
              // HTML dialog 요소의 close 메서드를 직접 호출
              const successModal = document.getElementById(
                "profile-update-success-modal"
              ) as HTMLDialogElement;
              const editModal = document.getElementById(
                "profile-edit-modal"
              ) as HTMLDialogElement;
              if (successModal) successModal.close();
              if (editModal) editModal.close();
            }}
          >
            확인
          </button>
        }
      >
        <div className="flex flex-col items-center justify-center gap-4">
          <svg
            className="text-success w-12 h-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-lg font-medium">
            프로필이 성공적으로 업데이트되었습니다.
          </p>
        </div>
      </Modal>

      {/* 에러 모달 추가 */}
      <Modal
        id="profile-update-error-modal"
        title="업데이트 실패"
        actions={
          <button
            className="btn btn-error"
            onClick={() => {
              const errorModal = document.getElementById(
                "profile-update-error-modal"
              ) as HTMLDialogElement;
              if (errorModal) errorModal.close();
            }}
          >
            확인
          </button>
        }
      >
        <div className="flex flex-col items-center justify-center gap-4">
          <svg
            className="text-error w-24 h-24"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-lg font-medium">
            프로필 업데이트에 실패했습니다. 다시 시도해 주세요.
          </p>
        </div>
      </Modal>
    </div>
  );
}

export default UserDetailPage;
