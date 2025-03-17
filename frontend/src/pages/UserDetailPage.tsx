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
const ACTIVITYTIME_OPTION = ["새벽", "오전", "오후", "저녁", "밤", "종일"];
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
  { title: "레벨", options: LEVEL_OPTIONS, key: "level" },
  { title: "활동 시간", options: ACTIVITYTIME_OPTION, key: "activityTime" },
  { title: "활동 요일", options: ACTIVITYDAY_OPTION, key: "activityDay" },
  {
    title: "활동 지역",
    options: ACTIVITYLOCATION_OPTION,
    key: "activityLocation",
  },
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
    <dialog id={id} className="modal">
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

  const handleSubmit = async () => {
    if (!nickName || !bio || !gender || !level || !tags.length) {
      alert("모든 값을 입력해주세요.");
      return;
    }

    const userIdNumber = Number(userId);

    // userProfileRequest 객체 생성 (파일을 제외한 데이터만)
    const userProfileRequest: UserPageDetailRequest = {
      userId: userIdNumber,
      userNickname: nickName,
      bio: bio,
      gender: gender,
      level: level,
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
      alert("프로필이 업데이트되었습니다.");

      // 모달 닫기
      closeModal("profile-edit-modal");
    } catch (error) {
      console.error("Failed to submit:", error);
      setIsLoading(false);
      alert("프로필 업데이트에 실패했습니다. 다시 시도해 주세요.");
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
    return <div className="font-semibold">Loading...</div>;
  }

  // 모달 동작
  // 버튼에서 onClick으로 동작
  const closeModal = (id: string) => {
    const modal = document.getElementById(id) as HTMLDialogElement;
    modal?.close();
  };

  const showModal = (id: string) => {
    const modal = document.getElementById(id) as HTMLDialogElement;
    modal?.showModal();
  };

  return (
    <div className="md:w-full max-w-screen-md rounded-xl w-[90%] mt-2 border-base-300 border-[1px] shadow-xl">
      {/* 배경이미지 & 프로필 이미지 */}
      <div className="flex flex-col relative">
        <img
          src={
            userDetail?.backgroundImg !== null
              ? `https://taiso-web-gpx-file-space.s3.ap-southeast-2.amazonaws.com/${userDetail?.backgroundImg}`
              : "/backgroundDefault.png"
          }
          alt="background"
          className="w-full h-64  object-cover rounded-t-xl"
        />
        <img
          src={
            userDetail?.profileImg !== null
              ? `https://taiso-web-gpx-file-space.s3.ap-southeast-2.amazonaws.com/${userDetail?.profileImg}`
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
            <div className="badge badge-primary badge-outline mr-1">
              {userDetail?.level}
            </div>
            <div className="badge badge-primary badge-outline mr-1">
              {userDetail?.gender}
            </div>
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
        <div className="border bg-blue-300 flex flex-col items-center justify-center mt-8 mb-8 pt-2 pb-4">
        <div className="text-2xl font-bold mb-3 mt-2 text-white">STRAVA</div>
            {!userDetail?.stravaConnected && (
            <div className="text-white">
                <div>아직 스트라바를 연동하지 않았습니다.</div>
              </div>
            )}
          {userDetail?.stravaConnected && (
          <div className="flex justify-center first:before:w-fit mx-auto gap-2 ">
            <div className="flex flex-col justify-center items-center border-2 border-base-300 p-2 rounded-xl">
              <div>횟수</div>
              <div>{userDetail?.userStravaDataCount}</div>
            </div>
            <div className="flex flex-col justify-center items-center border-2 border-base-300 p-2 rounded-xl">
              <div>주행거리</div>
              <div>{userDetail?.userStravaKm}</div>
            </div>
            <div className="flex flex-col justify-center items-center border-2 border-base-300 p-2 rounded-xl">
              <div>획득고도</div>
              <div>{userDetail?.userStravaElevation} M</div>
            </div>
            </div>
          )}
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

          {/* 성별 선택 */}
          <label
            className="label text-sm text-gray-500 mt-4 mr-auto"
            htmlFor="gender"
          >
            성별
          </label>
          <select
            id="gender"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="select select-bordered w-full"
          >
            {GENDER_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          {/* 레벨 선택 */}
          <label
            className="label text-sm text-gray-500 mt-4 mr-auto"
            htmlFor="level"
          >
            레벨
          </label>
          <select
            id="level"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="select select-bordered w-full"
          >
            {LEVEL_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          {/* 태그 선택 */}
          <div>
            {categories.map(({ title, options, key }) => (
              <div key={key} className="mb-4">
                <p className="text-sm font-semibold text-gray-600">{title}</p>
                <div className="flex gap-2 flex-wrap">
                  {options.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        setTags((prevTags) =>
                          prevTags.includes(option)
                            ? prevTags.filter((tag) => tag !== option)
                            : [...prevTags, option]
                        );
                      }}
                      className={`btn md:btn-sm btn-xs my-1 btn-outline text-gray-400 rounded-full border-1 hover:bg-primary hover:border-primary 
                        ${tags.includes(option) ? "btn-primary" : "btn-outline"
                        }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default UserDetailPage;
