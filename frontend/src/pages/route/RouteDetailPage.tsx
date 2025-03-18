import { useNavigate, useParams } from "react-router";
import routeService, { RouteDetailResponse } from "../../services/routeService";
import { useEffect, useState } from "react";
import { useAuthStore } from "../../stores/useAuthStore";
import RouteViewer from "../../components/RouteViewer";
import bookmarkService from "../../services/bookmarkService";

function RouteDetailPage() {
  const { routeId } = useParams();
  const [routeDetail, setRouteDetail] = useState<RouteDetailResponse | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [likePending, setLikePending] = useState(false);
  const [bookmarkPending, setBookmarkPending] = useState(false);
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
    // Return early if user is not logged in
    if (!user) {
      navigate("/auth/landing");
      return;
    }

    if (likePending || !routeDetail) return;
    setLikePending(true);
    const previousLikedState = routeDetail.liked;
    // Optimistic UI 업데이트: 좋아요 상태 즉시 토글
    setRouteDetail({
      ...routeDetail,
      liked: !previousLikedState,
      likeCount: previousLikedState
        ? routeDetail.likeCount - 1
        : routeDetail.likeCount + 1,
    });
    try {
      if (previousLikedState) {
        await routeService.unlikeRoute(Number(routeId));
      } else {
        await routeService.likeRoute(Number(routeId));
      }
    } catch (error) {
      // API 호출 실패 시 이전 상태로 롤백
      setRouteDetail({
        ...routeDetail,
        liked: previousLikedState,
        likeCount: previousLikedState
          ? routeDetail.likeCount
          : routeDetail.likeCount - 1,
      });
      console.error("좋아요 상태 업데이트 실패:", error);

      // 401 에러 체크 (인증 필요)
      if (
        error instanceof Error &&
        "response" in (error as any) &&
        (error as any).response?.status === 401
      ) {
        navigate("/auth/landing");
      }
    } finally {
      setLikePending(false);
    }
  };

  const handleToggleBookmark = async () => {
    if (bookmarkPending || !routeDetail) return;
    setBookmarkPending(true);
    const previousBookmarkedState = routeDetail.bookmarked;
    // Optimistic UI 업데이트: 북마크 상태 즉시 토글
    setRouteDetail({ ...routeDetail, bookmarked: !previousBookmarkedState });
    try {
      if (previousBookmarkedState) {
        await bookmarkService.deleteBookmarkRoute(Number(routeId));
      } else {
        await bookmarkService.bookmarkRoute(Number(routeId));
      }
    } catch (error) {
      // API 호출 실패 시 이전 상태로 롤백
      setRouteDetail({ ...routeDetail, bookmarked: previousBookmarkedState });
      console.error("북마크 상태 업데이트 실패:", error);

      // 401 에러 체크 (인증 필요)
      if (
        error instanceof Error &&
        "response" in (error as any) &&
        (error as any).response?.status === 401
      ) {
        navigate("/auth/landing");
      }
    } finally {
      setBookmarkPending(false);
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

  // Calculate elevation statistics from route points
  const calculateElevationStats = () => {
    if (!routeDetail?.routePoint || routeDetail.routePoint.length === 0) {
      return { minElevation: 0, maxElevation: 0, elevationDiff: 0 };
    }

    const elevations = routeDetail.routePoint.map((point) => point.elevation);
    const minElevation = Math.min(...elevations);
    const maxElevation = Math.max(...elevations);
    const elevationDiff = maxElevation - minElevation;

    return { minElevation, maxElevation, elevationDiff };
  };

  const { minElevation, maxElevation, elevationDiff } =
    calculateElevationStats();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col mt-2 gap-2 w-[90%]">
      <div className="flex justify-between">
        <div className="px-2 pt-2 mt-2">
          {/* 루트 이름 */}
          <div className="pb-1 text-3xl font-bold">
            {routeDetail?.routeName}
          </div>
          {/* 태그들 */}
          <div className="flex flex-wrap gap-1 pt-2 md:justify-start justify-center">
            {routeDetail?.tag.map((tag, index) => (
              <div
                key={index}
                className="badge badge-outline badge-primary p-3"
              >
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
        </div>

        {/* 좋아요, 북마크 아이콘 */}
        <div className="pt-3 flex items-start gap-1 mt-1 pr-3">
          {/* 북마크 아이콘 */}
          {!routeDetail?.bookmarked ? (
            <svg
              data-slot="icon"
              fill="none"
              strokeWidth="2"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              className="size-7 text-gray-600 top-3 right-5 z-10 cursor-pointer"
              onClick={handleToggleBookmark}
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
              className="size-7 text-blue-500 top-3 right-5 z-10 cursor-pointer"
              onClick={handleToggleBookmark}
            >
              <path
                clipRule="evenodd"
                fillRule="evenodd"
                d="M10 2c-1.716 0-3.408.106-5.07.31C3.806 2.45 3 3.414 3 4.517V17.25a.75.75 0 0 0 1.075.676L10 15.082l5.925 2.844A.75.75 0 0 0 17 17.25V4.517c0-1.103-.806-2.068-1.93-2.207A41.403 41.403 0 0 0 10 2Z"
              />
            </svg>
          )}

          {/* 좋아요 아이콘 */}
          <div className="flex flex-col text-red-500">
            {!routeDetail?.liked ? (
              <svg
                data-slot="icon"
                fill="none"
                strokeWidth="2"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                className="size-7 text-gray-600 top-3 right-5 z-10 cursor-pointer"
                onClick={handleToggleLike}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                ></path>
              </svg>
            ) : (
              <svg
                data-slot="icon"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                className="size-7 text-red-500 top-3 right-5 z-10 cursor-pointer"
                onClick={handleToggleLike}
              >
                <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z"></path>
              </svg>
            )}
            <span className="font-semibold flex items-center justify-center h-5 text-black">
              {routeDetail?.likeCount || 0}
            </span>
          </div>
        </div>
      </div>

      {/* 루트 한줄 소개 */}
      <div className="mt-1">
        <div className="divider -mt-1 -mb-[0.5px]"></div>
        <div className="py-4 pl-2">{routeDetail?.description}</div>
      </div>

      {/* 파일 */}
      <div className="flex justify-between p-3 mb-1 border bg-gray-100">
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
        <button
          className="btn btn-sm btn-primary"
          onClick={() =>
            window.open(`${routeDetail?.originalFilePath}`, "_blank")
          }
        >
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
          <div className="stat-value">{minElevation.toLocaleString()}m</div>
        </div>

        <div className="stat flex flex-col justify-center items-center">
          <div className="stat-title">최고 고도</div>
          <div className="stat-value">{maxElevation.toLocaleString()}m</div>
        </div>

        <div className="stat flex flex-col justify-center items-center">
          <div className="stat-title">고도 차이</div>
          <div className="stat-value">{elevationDiff.toLocaleString()}m</div>
        </div>
      </div>
      <div className="divider -mt-1 -mb-[0.5px]"></div>

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
