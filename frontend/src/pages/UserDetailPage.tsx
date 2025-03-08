import { useParams } from "react-router";
import userDetailService, { UserDetailResponse } from "../services/userDetailService";
import { useEffect, useState } from "react";
import { useAuthStore } from "../stores/useAuthStore";
import ReviewList from "../components/ReviewList";

function UserDetailPage() {
  const { userId } = useParams();
  const [userDetail, setUserDetail] = useState<UserDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();

  console.log(isLoading, user);

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
    return <div>Loading...</div>;
  }

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
            {user?.userId === userDetail?.userId && (
              <button type="submit" className="badge badge-outline badge-error ml-2">edit</button>
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
        <div tabIndex={0} className="collapse collapse-open bg-gray-100 border mb-6">
          <div className="collapse-content text-sm m-4">
            {userDetail?.bio}
          </div>
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
                className="inline-block h-8 w-8 stroke-current">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
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
                className="inline-block h-8 w-8 stroke-current">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"></path>
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
                className="inline-block h-8 w-8 stroke-current">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <div className="stat-title">등록 루트</div>
            <div className="stat-value text-lg">9개</div>
          </div>
        </div>
      </div>

      {/* 스트라바 통계 */}
      <div className="border bg-blue-300 flex flex-col items-center justify-center mt-8 mb-8 pt-2 pb-4">
        <div className="text-2xl font-bold m-3 text-white">
          STRAVA
        </div>
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
    </div>
  );
}

export default UserDetailPage;
