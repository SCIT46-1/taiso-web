import { useNavigate, useParams } from "react-router";
import routeService, { RouteDetailResponse } from "../../services/routeService";
import { useEffect, useState } from "react";
import { useAuthStore } from "../../stores/useAuthStore";
import RouteViewer from "../../components/RouteViewer";

function RouteDetailPage() {
  const { routeId } = useParams();
  const [routeDetail, setRouteDetail] = useState<RouteDetailResponse | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [likePending, setLikePending] = useState(false);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRouteDetail = async () => {
      setIsLoading(true);
      const routeDetailData = await routeService.getRouteDetail(
        Number(routeId)
      );
      setRouteDetail(routeDetailData);
      setIsLoading(false);
    };
    fetchRouteDetail();
  }, [routeId]);

  const handleToggleLike = async () => {
    if (likePending || !routeDetail) return;
    setLikePending(true);
    const previousLikedState = routeDetail.liked;
    // Optimistic UI 업데이트: 좋아요 상태 즉시 토글
    setRouteDetail({ ...routeDetail, liked: !previousLikedState });
    try {
      if (previousLikedState) {
        await routeService.unlikeRoute(Number(routeId));
      } else {
        await routeService.likeRoute(Number(routeId));
      }
    } catch (error) {
      // API 호출 실패 시 이전 상태로 롤백
      setRouteDetail({ ...routeDetail, liked: previousLikedState });
      console.error("좋아요 상태 업데이트 실패:", error);
      // 필요 시 사용자에게 에러 메시지를 노출하는 로직 추가 가능
    } finally {
      setLikePending(false);
    }
  };

  const handleDeleteRoute = async () => {
    try {
      const response = await routeService.deleteRoute(Number(routeId));
      console.log(response);
      navigate("/route");
    } catch (response) {
      console.error("루트 삭제 실패:", response);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col mt-2 gap-2 md:w-full w-[90%]">
      
      <div className="flex justify-between">
        <div className="px-2 pt-2">
          {/* 루트 이름 */}
          <div className="px-1 text-2xl font-semibold">{routeDetail?.routeName}</div>
          {/* 태그들 */}
          <div className="flex flex-wrap gap-1 pt-2 md:justify-start justify-center">
            {routeDetail?.tag.map((tag, index) => (
              <div key={index} className="badge badge-outline badge-primary">
                {tag}
              </div>
            ))}
            <div className="badge badge-primary badge-outline p-3">
              {routeDetail?.altitudeType}
            </div>
            <div className="badge badge-primary badge-outline p-3">
              {routeDetail?.distanceType}
            </div>
            <div className="badge badge-primary badge-outline p-3">
              {routeDetail?.roadType}
            </div>
          </div>
          {/* 루트 한줄 소개 */}
          <div className="flex justify-between p-2">
            {routeDetail?.description}
          </div>


        </div>
        {/* 좋아요, 북마크 아이콘 */}
        <div className="pt-3 flex items-start gap-1 mt-1 pr-3">
          <svg
            data-slot="icon"
            fill="none"
            strokeWidth="2"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            className="size-5 text-gray-600 top-3 right-5 z-10"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"
            ></path>
          </svg>
          <div className="flex flex-col text-red-500">
            <svg
              data-slot="icon"
              fill="none"
              strokeWidth="2"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              className="size-6 text-red-500 top-3 right-5 z-10"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
              ></path>
            </svg>
            <span className="font-semibold flex items-center justify-center h-5">
              25
            </span>
            </div>
        </div>
      </div>

      {/* 파일 */}
      <div className="flex justify-between p-3 mb-1 board board-1 rounded-lg border border-gray-300">
        {/* 루트 파일 */}
        <div
          className="flex items-center gap-1 hover:bg-base-200 p-1 rounded-md w-fit"
          onClick={() =>
            window.open(`${routeDetail?.originalFilePath}`, "_blank")
          }
        >
          <svg
            data-slot="icon"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            className="size-6"
          >
            <path d="M3 3.5A1.5 1.5 0 0 1 4.5 2h6.879a1.5 1.5 0 0 1 1.06.44l4.122 4.12A1.5 1.5 0 0 1 17 7.622V16.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 3 16.5v-13Z" />
          </svg>
          <div className="link">{routeDetail?.fileName}</div>
        </div>
        <button className="btn btn-sm btn-primary p-3 flex items-center justify-center">
          GPX 다운로드
        </button>
      </div>
      
      <RouteViewer routePoints={routeDetail?.routePoint} />

      <div className="divider -mt-1 -mb-[0.5px]"></div>
      <div className="stats stats-vertical lg:stats-horizontal divide-y-4 lg:divide-y-0 lg:divide-x-2">
        <div className="stat flex flex-col justify-center items-center">
          <div className="stat-title">거리</div>
          <div className="stat-value"> {routeDetail?.distance}km</div>
        </div>

        <div className="stat flex flex-col justify-center items-center">
          <div className="stat-title">획득 고도</div>
          <div className="stat-value">{routeDetail?.altitude}m</div>
        </div>

        <div className="stat flex flex-col justify-center items-center">
          <div className="stat-title">최저 고도</div>
          <div className="stat-value">1,200m</div>
        </div>

        <div className="stat flex flex-col justify-center items-center">
          <div className="stat-title">최고 고도</div>
          <div className="stat-value">1,200m</div>
        </div>

        <div className="stat flex flex-col justify-center items-center">
          <div className="stat-title">고도 차이</div>
          <div className="stat-value">1,200m</div>
        </div>
      </div>
      <div className="divider -mt-1 -mb-[0.5px]"></div>

      <div className="flex items-center justify-center gap-1 mt-10">
        <button
          className={`btn btn-outline w-fit no-animation transition-none ${
            routeDetail?.liked ? "" : "btn-error transition-none"
          }`}
          onClick={handleToggleLike}
          disabled={likePending}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          좋아요
        </button>
        <div className="btn btn-primary w-fit no-animation">
          <svg
            data-slot="icon"
            className="size-6"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              clipRule="evenodd"
              fillRule="evenodd"
              d="M10 2c-1.716 0-3.408.106-5.07.31C3.806 2.45 3 3.414 3 4.517V17.25a.75.75 0 0 0 1.075.676L10 15.082l5.925 2.844A.75.75 0 0 0 17 17.25V4.517c0-1.103-.806-2.068-1.93-2.207A41.403 41.403 0 0 0 10 2Z"
            />
          </svg>
          북마크
        </div>
      </div>
      {user?.userId === routeDetail?.userId && (
        <div>
          <button onClick={handleDeleteRoute} className="btn btn-primary">
            삭제
          </button>
        </div>
      )}
    </div>
  );
}

export default RouteDetailPage;
