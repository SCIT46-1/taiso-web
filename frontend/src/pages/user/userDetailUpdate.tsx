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
    <div>
      <div className="text-2xl font-bold">UserDetailUpdate</div>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <input
          type="text"
          name="userNickname"
          placeholder="닉네임"
          className="w-full input input-bordered"
          value={updateUserInfo?.userNickname || ""}
          onChange={handleUpdateUserInfo}
        />
        <input
          type="text"
          name="fullName"
          placeholder="이름"
          className="w-full input input-bordered"
          value={updateUserInfo?.fullName || ""}
          onChange={handleUpdateUserInfo}
        />
        <input
          type="text"
          name="phoneNumber"
          placeholder="전화번호"
          className="w-full input input-bordered"
          value={updateUserInfo?.phoneNumber || ""}
          onChange={handleUpdateUserInfo}
        />
        <input
          type="text"
          name="birthDate"
          placeholder="생년월일"
          className="w-full input input-bordered"
          value={updateUserInfo?.birthDate || ""}
          onChange={handleUpdateUserInfo}
        />
        <input
          type="text"
          name="gender"
          placeholder="성별"
          className="w-full input input-bordered"
          value={updateUserInfo?.gender || ""}
          onChange={handleUpdateUserInfo}
        />
        <input
          type="number"
          name="height"
          placeholder="키"
          className="w-full input input-bordered"
          value={updateUserInfo?.height || ""}
          onChange={handleUpdateUserInfo}
        />
        <input
          type="number"
          name="weight"
          placeholder="몸무게"
          className="w-full input input-bordered"
          value={updateUserInfo?.weight || ""}
          onChange={handleUpdateUserInfo}
        />
        <input
          type="number"
          name="ftp"
          placeholder="FTP"
          className="w-full input input-bordered"
          value={updateUserInfo?.ftp || ""}
          onChange={handleUpdateUserInfo}
        />

        <button type="submit" className="btn btn-primary">
          저장
        </button>
      </form>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-bold mb-4">업데이트 성공</h3>
            <p className="mb-6">회원 정보가 성공적으로 업데이트되었습니다.</p>
            <div className="flex justify-end">
              <button
                onClick={handleConfirmSuccess}
                className="btn btn-primary"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-bold mb-4 text-error">업데이트 실패</h3>
            <p className="mb-6">회원 정보 업데이트에 실패했습니다.</p>
            <div className="flex justify-end">
              <button
                onClick={handleCloseErrorModal}
                className="btn btn-primary"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserDetailUpdate;
