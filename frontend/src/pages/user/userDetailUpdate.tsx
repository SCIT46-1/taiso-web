// {
//   "nickname": "string",

//   "phoneNumber": "string",
//   "birthDate": "2025-03-07",
//   "bio": "string",
//   "gender": "남자",
//   "height": 1073741824,
//   "weight": 1073741824,
//   "ftp": 1073741824
// }

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import userDetailService, {
  UserDetailPatchRequest,
  UserDetailResponse,
} from "../../services/userDetailService";
import GlobalModal from "../../components/GlobalModal";

function UserDetailUpdate() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState<UserDetailResponse>();
  const [isLoading, setIsLoading] = useState(true);
  const [updateUserInfo, setUpdateUserInfo] =
    useState<UserDetailPatchRequest>();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  useEffect(() => {
    const fetchUserDetail = async () => {
      try {
        const userDetail = await userDetailService.getUserDetail();
        setUserInfo(userDetail);
        // 기존 사용자 정보로 updateUserInfo 초기화
        setUpdateUserInfo({
          userNickname: userDetail.userNickname,
          phoneNumber: userDetail.phoneNumber,
          birthDate: userDetail.birthDate,
          gender: userDetail.gender,
          height: userDetail.height,
          weight: userDetail.weight,
          ftp: userDetail.ftp,
          fullName: userDetail.fullName,
          level: userDetail.level,
        });
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserDetail();
  }, []);

  console.log(userInfo);

  const handleUpdateUserInfo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUpdateUserInfo((prev) => {
      // Create a new object with the spread values
      const updated = { ...prev, [name]: value };
      // Return it with the correct type assertion
      return updated as UserDetailPatchRequest;
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await userDetailService.updateUserDetail(
        updateUserInfo as UserDetailPatchRequest
      );
      setShowSuccessModal(true);
      navigate("/user/me/account");
    } catch (error) {
      console.error("회원 정보 업데이트 실패:", error);
      setShowErrorModal(true);
    }
  };

  const handleConfirmSuccess = () => {
    setShowSuccessModal(false);
    navigate("/user/me/account");
  };

  const handleCloseErrorModal = () => {
    setShowErrorModal(false);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="text-2xl font-bold mb-8 text-center">개인정보 수정</div>
      <form
        className="flex flex-col items-center justify-center max-w-sm mx-auto relative w-[20rem]"
        onSubmit={handleSubmit}
      >
        <label
          className="label text-sm text-gray-500 mt-4 mr-auto gap-1"
          htmlFor="password"
        >
          <svg
            data-Slot="icon"
            fill="currentColor"
            strokeWidth={1.5}
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            className="h-4 w-4 opacity-70"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
            />
          </svg>
          닉네임
        </label>
        <input
          type="text"
          name="userNickname"
          placeholder="닉네임"
          className="w-full input input-bordered"
          value={updateUserInfo?.userNickname || ""}
          onChange={handleUpdateUserInfo}
        />
        <label
          className="label text-sm text-gray-500 mt-4 mr-auto gap-1"
          htmlFor="password"
        >
          <svg
            data-Slot="icon"
            fill="currentColor"
            strokeWidth={1.5}
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            className="h-4 w-4 opacity-70"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
            />
          </svg>
          이름
        </label>
        <input
          type="text"
          name="fullName"
          placeholder="이름"
          className="w-full input input-bordered"
          value={updateUserInfo?.fullName || ""}
          onChange={handleUpdateUserInfo}
        />
        <label
          className="label text-sm text-gray-500 mt-4 mr-auto gap-1"
          htmlFor="password"
        >
          <svg
            data-Slot="icon"
            fill="currentColor"
            strokeWidth={1.5}
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            className="h-4 w-4 opacity-70"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
            />
          </svg>
          전화번호
        </label>
        <input
          type="text"
          name="phoneNumber"
          placeholder="전화번호"
          className="w-full input input-bordered"
          value={updateUserInfo?.phoneNumber || ""}
          onChange={handleUpdateUserInfo}
        />
        <label
          className="label text-sm text-gray-500 mt-4 mr-auto gap-1"
          htmlFor="password"
        >
          <svg
            data-Slot="icon"
            fill="currentColor"
            strokeWidth={1.5}
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            className="h-4 w-4 opacity-70"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
            />
          </svg>
          생년월일
        </label>
        <input
          type="text"
          name="birthDate"
          placeholder="생년월일"
          className="w-full input input-bordered"
          value={updateUserInfo?.birthDate || ""}
          onChange={handleUpdateUserInfo}
        />
        <label
          className="label text-sm text-gray-500 mt-4 mr-auto gap-1"
          htmlFor="password"
        >
          <svg
            data-Slot="icon"
            fill="currentColor"
            strokeWidth={1.5}
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            className="h-4 w-4 opacity-70"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
            />
          </svg>
          성별
        </label>
        <input
          type="text"
          name="gender"
          placeholder="성별"
          className="w-full input input-bordered"
          value={updateUserInfo?.gender || ""}
          onChange={handleUpdateUserInfo}
        />
        <label
          className="label text-sm text-gray-500 mt-4 mr-auto gap-1"
          htmlFor="password"
        >
          <svg
            data-Slot="icon"
            fill="currentColor"
            strokeWidth={1.5}
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            className="h-4 w-4 opacity-70"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
            />
          </svg>
          키
        </label>
        <input
          type="number"
          name="height"
          placeholder="키"
          className="w-full input input-bordered"
          value={updateUserInfo?.height || ""}
          onChange={handleUpdateUserInfo}
        />
        <label
          className="label text-sm text-gray-500 mt-4 mr-auto gap-1"
          htmlFor="password"
        >
          <svg
            data-Slot="icon"
            fill="currentColor"
            strokeWidth={1.5}
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            className="h-4 w-4 opacity-70"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
            />
          </svg>
          몸무게
        </label>
        <input
          type="number"
          name="weight"
          placeholder="몸무게"
          className="w-full input input-bordered"
          value={updateUserInfo?.weight || ""}
          onChange={handleUpdateUserInfo}
        />
        <label
          className="label text-sm text-gray-500 mt-4 mr-auto gap-1"
          htmlFor="password"
        >
          <svg
            data-Slot="icon"
            fill="currentColor"
            strokeWidth={1.5}
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            className="h-4 w-4 opacity-70"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
            />
          </svg>
          FTP
        </label>
        <input
          type="number"
          name="ftp"
          placeholder="FTP"
          className="w-full input input-bordered"
          value={updateUserInfo?.ftp || ""}
          onChange={handleUpdateUserInfo}
        />

        <button type="submit" className="btn btn-primary mt-10">
          저장
        </button>
      </form>

      {/* Success Modal */}
      {showSuccessModal && (
        <GlobalModal
          id="Success-modal"
          imgType="success"
          title="업데이트 성공"
          actions={
            <button onClick={handleConfirmSuccess} className="btn btn-primary">
              확인
            </button>
          }
        >
          <>
            <p className="mb-6">회원 정보가 성공적으로 업데이트되었습니다.</p>
          </>
        </GlobalModal>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <GlobalModal
          id="Error-modal"
          imgType="error"
          title="업데이트 실패"
          actions={
            <button onClick={handleCloseErrorModal} className="btn btn-primary">
              확인
            </button>
          }
        >
          <>
            <p className="mb-6">회원 정보 업데이트에 실패했습니다.</p>
          </>
        </GlobalModal>
      )}
    </div>
  );
}

export default UserDetailUpdate;
