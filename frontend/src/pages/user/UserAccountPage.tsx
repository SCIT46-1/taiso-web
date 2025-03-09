import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import userDetailService, {
  UserAuthInfoResponse,
  UserDetailResponse,
} from "../../services/userDetailService";
import { useAuthStore } from "../../stores/useAuthStore";

function UserAccountPage() {
  const [userDetail, setUserDetail] = useState<UserDetailResponse | null>(null);
  const [userAuthInfo, setUserAuthInfo] = useState<UserAuthInfoResponse | null>(
    null
  );
  const { isOAuth } = useAuthStore();

  useEffect(() => {
    const fetchUserDetail = async () => {
      const data = await userDetailService.getUserDetail();
      setUserDetail(data);
    };
    fetchUserDetail();
  }, []);

  useEffect(() => {
    const fetchUserAuthInfo = async () => {
      const data = await userDetailService.getUserAuthInfo();
      setUserAuthInfo(data);
    };
    fetchUserAuthInfo();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">사용자 계정 정보</h1>

      {/* 기본 사용자 정보 */}
      <div className="mb-6 border p-4">
        <div className="flex gap-4">
          <div>
            <h2 className="text-lg font-semibold">
              {userDetail?.userNickname || "닉네임 없음"}
            </h2>
            <p>이메일: {userAuthInfo?.userEmail || "이메일 정보 없음"}</p>
            <p>자기소개: {userDetail?.bio || "자기소개 없음"}</p>
            <div className="mt-2">
              <Link
                to="/user/me/update"
                className="bg-blue-500 text-white px-3 py-1 rounded"
              >
                정보 수정
              </Link>
              {!isOAuth && (
                <Link to="/user/me/account/update">비밀번호 수정 </Link>
              )}
            </div>
          </div>
        </div>

        {/* 태그 정보 */}
        {userDetail?.tags && userDetail.tags.length > 0 && (
          <div className="mt-3">
            <p>태그:</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {userDetail.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-gray-200 px-2 py-1 rounded text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 사용자 상세 정보 */}
      <div className="border p-4">
        <h2 className="text-lg font-semibold mb-3">개인 정보</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p>
              <strong>이름:</strong> {userDetail?.fullName || "정보 없음"}
            </p>
            <p>
              <strong>전화번호:</strong>{" "}
              {userDetail?.phoneNumber || "정보 없음"}
            </p>
            <p>
              <strong>생년월일:</strong> {userDetail?.birthDate || "정보 없음"}
            </p>
            <p>
              <strong>성별:</strong> {userDetail?.gender || "정보 없음"}
            </p>
          </div>

          <div>
            <p>
              <strong>키:</strong>{" "}
              {userDetail?.height ? `${userDetail.height} cm` : "정보 없음"}
            </p>
            <p>
              <strong>몸무게:</strong>{" "}
              {userDetail?.weight ? `${userDetail.weight} kg` : "정보 없음"}
            </p>
            <p>
              <strong>레벨:</strong> {userDetail?.level || "정보 없음"}
            </p>
            <p>
              <strong>FTP:</strong> {userDetail?.ftp || "정보 없음"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserAccountPage;
