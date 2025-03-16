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
    <div className="md:w-full max-w-screen-md rounded-xl w-[90%] mt-2 border-base-300 border-[1px] shadow-xl">
      <div className="container mx-auto p-4">
          <div className="flex justify-between items-center p-3">
            <h1 className="text-xl font-bold">내 계정 정보</h1>
            <div className="flex gap-4">
              {!isOAuth && (
              <Link to="/user/me/account/update" className="px-3 py-1 rounded bg-gray-300">
                  비밀번호 변경
                </Link>
              )}
            </div>
          </div>


        {/* 유저 닉네임 */}
        <div className="border px-6 py-4 bg-gray-100">
          <p className="text-sm">내 닉네임</p>
          <h2 className="text-lg font-semibold mt-1">
            {userDetail?.userNickname || "닉네임 없음"}
          </h2>
        </div>

        {/* 기본 사용자 정보 */}
        <div className="mb-3 border px-4 py-6">
         
          <div className="grid grid-cols-1 gap-2">
            <div className="grid grid-cols-[1fr_6fr] gap-4">
              <div className="text-right font-semibold">
                <p>이메일</p>
              </div>
              <div>
                <p>{userAuthInfo?.userEmail || "이메일 정보 없음"}</p>
              </div>
            </div>
            <div className="grid grid-cols-[1fr_6fr] gap-4">
              <div className="text-right font-semibold">
                <p>자기소개</p>
              </div>
              <div>
                <p>{userDetail?.bio || "자기소개 없음"}</p>
              </div>
            </div>
            {/* 태그 정보 */}
            {userDetail?.tags && userDetail.tags.length > 0 && (
              <div className="grid grid-cols-[1fr_6fr] gap-4">
                <div className="text-right font-semibold">
                  <p>태그</p>
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {userDetail.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-transparent px-2 py-1 rounded-full text-sm border border-primary text-primary"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          
          
    </div>
    
        <div className="flex justify-end p-3">
          <Link
            to="/user/me/update"
            className="bg-blue-500 text-white px-3 py-1 rounded"
          >
            개인정보 수정
          </Link>
        </div>

        {/* 사용자 상세 정보 */}
        <div className="border px-4 py-1 bg-gray-200">
            <h2 className="text-lg font-semibold my-3">개인 정보</h2>
        </div>
        <div className="border px-4 py-6">
          {/* 그리드 레이아웃: 제목/데이터/제목/데이터 */}
          <div className="grid grid-cols-[1fr_2fr_1fr_2fr] gap-x-3 gap-y-3">
            {/* 1행 */}
            <div className="text-right font-semibold">이름</div>
            <div>{userDetail?.fullName || "-"}</div>

            <div className="text-right font-semibold">키</div>
            <div>{userDetail?.height ? `${userDetail.height} cm` : "-"}</div>

            {/* 2행 */}
            <div className="text-right font-semibold">전화번호</div>
            <div>{userDetail?.phoneNumber || "-"}</div>

            <div className="text-right font-semibold">몸무게</div>
            <div>{userDetail?.weight ? `${userDetail.weight} kg` : "-"}</div>

            {/* 3행 */}
            <div className="text-right font-semibold">생년월일</div>
            <div>{userDetail?.birthDate || "-"}</div>

            <div className="text-right font-semibold">레벨</div>
            <div>{userDetail?.level || "-"}</div>

            {/* 4행 */}
            <div className="text-right font-semibold">성별</div>
            <div>{userDetail?.gender || "-"}</div>

            <div className="text-right font-semibold">FTP</div>
            <div>{userDetail?.ftp || "-"}</div>
          </div>
        </div>
      </div>

    </div>
  );
}

export default UserAccountPage;
