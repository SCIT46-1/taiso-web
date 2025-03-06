import { useParams } from "react-router";
import { useEffect, useState } from "react";
import clubService, { ClubDetailResponse } from "../../services/clubService";
import ImageWithSkeleton from "../../components/ImageWithSkeleton";

function ClubDetailPage() {
  const { clubId } = useParams();

  const [clubDetail, setClubDetail] = useState<ClubDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchClubDetail = async () => {
      try {
        const data = await clubService.getClubDetail(Number(clubId));
        setClubDetail(data);
      } catch (error) {
        console.error("클럽 정보를 불러오는데 실패했습니다.", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchClubDetail();
  }, [clubId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (!clubDetail) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold mb-4">클럽을 찾을 수 없습니다</h2>
        <button
          className="btn btn-primary"
          onClick={() => window.history.back()}
        >
          돌아가기
        </button>
      </div>
    );
  }

  // 생성일 포맷팅
  const createdDate = new Date(clubDetail.createdAt);
  const formattedDate = `${createdDate.getFullYear()}년 ${
    createdDate.getMonth() + 1
  }월 ${createdDate.getDate()}일`;

  // 멤버 비율 계산
  const memberPercentage = (clubDetail.currentScale / clubDetail.maxUser) * 100;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 클럽 헤더 */}
      <div className="card bg-base-100 shadow-xl mb-8">
        <div className="card-body">
          <div className="flex flex-col md:flex-row gap-6">
            {/* 클럽 이미지 */}
            <div className="w-full md:w-64 flex-shrink-0">
              {clubDetail.clubProfileImageId ? (
                <ImageWithSkeleton
                  src={`https://taiso-web-gpx-file-space.s3.ap-southeast-2.amazonaws.com/${clubDetail.clubProfileImageId}`}
                  alt={clubDetail.clubName}
                />
              ) : (
                <div className="bg-base-300 rounded-lg w-full h-64 flex items-center justify-center">
                  <span className="text-3xl font-bold opacity-30">
                    {clubDetail.clubName.substring(0, 2).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* 클럽 기본 정보 */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{clubDetail.clubName}</h1>

              <div className="flex items-center mb-2">
                <div className="badge badge-primary mr-2">리더</div>
                <span>{clubDetail.clubLeader.leaderName}</span>
              </div>

              <div className="mb-4">
                <p className="text-sm text-base-content/70">
                  생성일: {formattedDate}
                </p>
              </div>

              <div className="tags flex flex-wrap gap-2 mb-4">
                {clubDetail.tags.map((tag, index) => (
                  <div key={index} className="badge badge-outline">
                    {tag}
                  </div>
                ))}
              </div>

              <div className="mb-4">
                <p className="whitespace-pre-line">
                  {clubDetail.clubDescription}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 멤버십 정보 */}
      <div className="card bg-base-100 shadow-xl mb-8">
        <div className="card-body">
          <h2 className="card-title mb-4">멤버십 현황</h2>

          <div className="flex items-center gap-4 mb-2">
            <div className="stats shadow flex-1">
              <div className="stat">
                <div className="stat-title">현재 인원</div>
                <div className="stat-value">{clubDetail.currentScale}</div>
              </div>
              <div className="stat">
                <div className="stat-title">최대 인원</div>
                <div className="stat-value">{clubDetail.maxUser}</div>
              </div>
            </div>
          </div>

          <div className="w-full">
            <div className="flex justify-between mb-1">
              <span className="text-base font-medium">인원 현황</span>
              <span className="text-sm font-medium">
                {memberPercentage.toFixed(0)}%
              </span>
            </div>
            <progress
              className="progress progress-primary w-full"
              value={memberPercentage}
              max="100"
            ></progress>
          </div>
        </div>
      </div>

      {/* 멤버 목록 */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title mb-4">멤버 목록</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clubDetail.users.map((user) => (
              <div
                key={user.userId}
                className="card card-side bg-base-200 shadow-sm"
              >
                <figure className="pl-4">
                  {user.userProfileImage ? (
                    <div className="avatar">
                      <div className="w-16 h-16 rounded-full">
                        <ImageWithSkeleton
                          src={`/api/images/${user.userProfileImage}`}
                          alt={user.userNickname}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="avatar placeholder">
                      <div className="bg-neutral-focus text-neutral-content rounded-full w-16 h-16">
                        <span className="text-xl">
                          {user.userNickname.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                    </div>
                  )}
                </figure>
                <div className="card-body py-4">
                  <h3 className="card-title text-base">{user.userNickname}</h3>
                  <p className="text-sm truncate">
                    {user.bio || "소개글이 없습니다."}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClubDetailPage;
