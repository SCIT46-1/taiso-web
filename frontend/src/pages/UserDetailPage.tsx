import userDetailService, {
  UserPageDetailResponse,
} from "../services/userDetailService";
import { useEffect, useState } from "react";
import { useAuthStore } from "../stores/useAuthStore";
import ReviewList from "../components/ReviewList";
import { useParams } from "react-router";

// 모달
interface ModalProps {
  id: string;
  title: string;
  children: React.ReactNode;
  actions: React.ReactNode;
}

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
  //로딩 상태 관리
  const [loadingEdit, setLoadingEdit] = useState(false);
  //데이터 관리
  const [nickName, setNickName] = useState<string>("");
  const [bio, setBio] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [level, setLevel] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
  const [inputTag, setInputTag] = useState<string>("");
  const [availableTags, setAvailableTags] = useState<string[]>([
    "React",
    "JavaScript",
    "Node.js",
    "CSS",
    "HTML",
  ]); // 예시 태그들

  console.log(
    setLoadingEdit,
    nickName,
    bio,
    gender,
    level,
    tags,
    inputTag,
    availableTags,
    setAvailableTags
  );

  console.log(isLoading, user);

  // 데이터 로딩
  useEffect(() => {
    const fetchUserDetail = async () => {
      setIsLoading(true);
      try {
        const userDetailData = await userDetailService.getUserPageDetail(
          Number(userId)
        );
        // userDetailData를 제대로 받아왔을 때만 상태 업데이트
        if (userDetailData) {
          setUserDetail(userDetailData);
        } else {
          setUserDetail(null); // 데이터가 없으면 null 처리
        }
      } catch (error) {
        console.error("데이터 로딩 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserDetail();
  }, [userId]); // userId가 변경될 때마다 실행

  // 로딩 중일 때 처리
  if (isLoading) {
    return <div className="font-semibold">Loading...</div>;
  }

  // 태그 추가 함수
  const handleAddTag = () => {
    if (inputTag && !tags.includes(inputTag)) {
      setTags([...tags, inputTag]);
      setInputTag(""); // 입력 필드 초기화
    }
  };

  // 태그 삭제 함수
  const handleTagRemove = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  // 태그 입력 값 변화 처리
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputTag(e.target.value);
  };

  // // 로딩 핸들링
  // const handleEditProfile = async () => {
  //   setLoadingEdit(true);
  //   try {
  //     await userDetailService.patchUserPageDetail(Number(userId));
  //     closeModal("profile-edit-modal");
  //   } catch (error) {
  //     console.error("참여 실패:", error);
  //     closeModal("profile-edit-modal");
  //   } finally {
  //     setLoadingEdit(false);
  //   }
  // };

  // 모달 동작
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
          src={`https://taiso-web-gpx-file-space.s3.ap-southeast-2.amazonaws.com/${userDetail?.userBackgroundImg}`}
          alt="background"
          className="w-full h-64 bg-gray-100 object-cover rounded-t-xl"
        />
        <img
          src={`https://taiso-web-gpx-file-space.s3.ap-southeast-2.amazonaws.com/${userDetail?.userProfileImg}`}
          alt="profile"
          className="size-24 rounded-full bg-blue-200 absolute -bottom-12 sm:left-14 left-6"
        />
      </div>
      {/* 회원 정보 */}
      <div className="flex flex-col sm:ml-12 ml-6 mt-14 w-[85%] p-2">
        <div className="flex gap-2 mb-2 flex flex-col">
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
            <div className="stat-value text-primary text-lg">26개</div>
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
            <div className="stat-value text-lg">2개</div>
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
            <div className="stat-value text-lg">9개</div>
          </div>
        </div>
      </div>

      {/* 스트라바 통계 */}
      <div className="border bg-blue-300 flex flex-col items-center justify-center mt-8 mb-8 pt-2 pb-4">
        <div className="text-2xl font-bold m-3 text-white">STRAVA</div>
        <div className="flex justify-center first:before:w-fit mx-auto gap-2 ">
          <div className="flex flex-col justify-center items-center border-2 border-base-300 p-2 rounded-xl">
            <div>주행거리</div>
            <div>DUMMY</div>
          </div>
          <div className="flex flex-col justify-center items-center border-2 border-base-300 p-2 rounded-xl">
            <div>획득고도</div>
            <div>DUMMY</div>
          </div>
        </div>
      </div>

      {/* 리뷰 */}
      <ReviewList userId={Number(userId)} />
      <div className="h-24"></div>

      {/* 모달 컴포넌트들 */}
      <Modal
        id="profile-edit-modal"
        title="profile edit"
        actions={
          <>
            <button
              className="btn btn-primary"
              disabled={loadingEdit}
              // onClick={handleEditProfile}
            >
              {loadingEdit ? "수정중..." : "수정"}
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
        <>
          <div>
            <form
              // onSubmit={handleFormSubmit}
              className="flex flex-col items-center justify-center max-w-sm mx-auto relative w-[20rem]"
            >
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
                value={userDetail?.userNickname || ""}
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
                value={userDetail?.bio || ""}
                onChange={(e) => setBio(e.target.value)}
                className="textarea textarea-bordered w-full"
              ></textarea>

              {/* 성별 선택 */}
              <label
                className="label text-sm text-gray-500 mt-4 mr-auto"
                htmlFor="gender"
              >
                성별
              </label>
              <select
                id="gender"
                value={userDetail?.gender || "그외"} // default로 'none'을 설정
                onChange={(e) => setGender(e.target.value)}
                className="select select-bordered w-full"
              >
                <option value="그외">선택 안 함</option>
                <option value="남자">남성</option>
                <option value="여자">여성</option>
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
                value={userDetail?.level || ""}
                onChange={(e) => setLevel(e.target.value)}
                className="select select-bordered w-full"
              >
                <option value="무경력자">무경력자</option>
                <option value="초보자">초보자</option>
                <option value="입문자">입문자</option>
                <option value="중수">중수</option>
                <option value="고수">고수</option>
              </select>

              {/* 태그 입력 */}
              <div>
                <label className="label text-sm text-gray-500 mt-4 mr-auto">
                  태그
                </label>
                <div className="flex w-full items-center">
                  <input
                    type="text"
                    placeholder="태그 추가"
                    value={inputTag}
                    onChange={handleInputChange}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleAddTag(); // 엔터 키로 태그 추가
                      }
                    }}
                    className="input input-bordered w-full"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="btn btn-sm ml-2"
                  >
                    추가
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 mt-2 w-full">
                  {/* 이미 선택된 태그 표시 */}
                  {tags.map((tag, index) => (
                    <div
                      key={index}
                      className="badge badge-primary flex items-center"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleTagRemove(tag)}
                        className="ml-1 text-white"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                {/* 선택할 수 있는 태그 리스트 */}
                <div className="mt-2">
                  <label className="label text-sm text-gray-500">
                    선택 가능한 태그
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableTags
                      .filter((availableTag) => !tags.includes(availableTag)) // 이미 선택된 태그는 제외
                      .map((availableTag, index) => (
                        <div
                          key={index}
                          className="badge badge-outline cursor-pointer"
                        >
                          {availableTag}
                          <button
                            type="button"
                            onClick={() => {
                              setTags([...tags, availableTag]);
                            }}
                            className="ml-1 text-white"
                          >
                            + 태그 추가
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              {/* 에러 메시지 */}
              {/* {error && <span className="mt-2 text-sm text-red-400 w-full">{error}</span>}
              {successMessage && <span className="mt-2 text-sm text-green-500 w-full">{successMessage}</span>} */}

              {/* 제출 버튼 */}
              <button
                type="submit"
                //     disabled={loading}
                //     className={btn btn-primary w-[20rem] mt-6 ${loading ? "disabled" : ""}}
              >
                {/* {loading ? "업데이트 중..." : "프로필 변경"} */}
              </button>
            </form>
          </div>
        </>
      </Modal>
    </div>
  );
}

export default UserDetailPage;
