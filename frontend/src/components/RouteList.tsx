import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import routeService, { RouteListResponse } from "../services/routeService";
import ImageWithSkeleton from "./ImageWithSkeleton";
import bookmarkService from "../services/bookmarkService";

interface RouteListProps {
  sort: string;
  region: string;
  distanceType: string;
  altitudeType: string;
  roadType: string;
  tags: string[];
}

function RouteList({
  sort,
  region,
  distanceType,
  altitudeType,
  roadType,
  tags,
}: RouteListProps) {
  const PAGE_SIZE = 8;
  const [isLoading, setIsLoading] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [routeList, setRouteList] = useState<RouteListResponse[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const navigate = useNavigate();
  const [isLastPage, setIsLastPage] = useState(false);

  // sort prop이 바뀌면 페이지와 목록을 초기화
  useEffect(() => {
    setPage(0);
    setRouteList([]);
    setHasMore(true);
  }, [sort]);

  const fetchRouteList = async () => {
    let loaderTimer: NodeJS.Timeout | null = null;

    try {
      setIsLoading(true);
      // 요청이 300ms 이상 걸리면 loader 표시
      loaderTimer = setTimeout(() => {
        setShowLoader(true);
      }, 300);

      const data = await routeService.getRouteList(
        page,
        PAGE_SIZE,
        sort,
        region,
        distanceType,
        altitudeType,
        roadType,
        tags
      );
      setIsLastPage(data.last);
      setRouteList((prev) =>
        page === 0 ? data.content : [...prev, ...data.content]
      );
      setHasMore(data.content.length >= PAGE_SIZE);
    } catch (error) {
      console.error(error);
      navigate("/error");
    } finally {
      if (loaderTimer) {
        clearTimeout(loaderTimer);
      }
      setIsLoading(false);
      setShowLoader(false);
    }
  };

  // page, sort 및 기타 필터 상태가 변경될 때마다 데이터 재요청
  useEffect(() => {
    fetchRouteList();
  }, [page, sort, distanceType, altitudeType, roadType, tags]);

  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
  };

  // 좋아요 토글 처리 함수
  const handleLikeToggle = async (
    e: React.MouseEvent,
    route: RouteListResponse
  ) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      if (!route.liked) {
        await routeService.likeRoute(route.routeId);
      } else {
        await routeService.unlikeRoute(route.routeId);
      }

      // 로컬 상태 업데이트
      setRouteList((prevList) =>
        prevList.map((item) =>
          item.routeId === route.routeId
            ? {
                ...item,
                liked: !item.liked,
                likeCount: item.liked ? item.likeCount - 1 : item.likeCount + 1,
              }
            : item
        )
      );
    } catch (error) {
      console.error("Like operation failed:", error);

      // 401 에러 체크 (인증 필요)
      if (
        error instanceof Error &&
        "response" in (error as any) &&
        (error as any).response?.status === 401
      ) {
        navigate("/auth/landing");
      }
    }
  };

  // 북마크 토글 처리 함수
  const handleBookmarkToggle = async (
    e: React.MouseEvent,
    route: RouteListResponse
  ) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      if (!route.bookmarked) {
        await bookmarkService.bookmarkRoute(route.routeId);
      } else {
        await bookmarkService.deleteBookmarkRoute(route.routeId);
      }

      // 로컬 상태 업데이트
      setRouteList((prevList) =>
        prevList.map((item) =>
          item.routeId === route.routeId
            ? { ...item, bookmarked: !item.bookmarked }
            : item
        )
      );
    } catch (error) {
      console.error("Bookmark operation failed:", error);

      // 401 에러 체크 (인증 필요)
      if (
        error instanceof Error &&
        "response" in (error as any) &&
        (error as any).response?.status === 401
      ) {
        navigate("/auth/landing");
      }
    }
  };

  return (
    <div className="flex flex-col w-[95%] mx-auto">
      {/* grid layout 적용: 모바일은 1열, sm은 2열, md는 3열, lg는 4열 */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-">
        {routeList.map((route) => (
          <Link
            to={`/route/${route.routeId}`}
            key={route.routeId}
            className="group"
          >
            <div className="bg-base-100 w-full cursor-pointer p-3 rounded-2xl relative">
              {/* 좋아요 아이콘 */}
              {!route.liked ? (
                <svg
                  data-slot="icon"
                  fill="none"
                  strokeWidth="2.25"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                  className="size-5 text-gray-600 absolute top-5 right-11 z-10"
                  onClick={(e) => handleLikeToggle(e, route)}
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
                  className="size-5 text-red-500 absolute top-5 right-11 z-10"
                  onClick={(e) => handleLikeToggle(e, route)}
                >
                  <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z"></path>
                </svg>
              )}

              {/* 북마크 아이콘 */}
              {!route.bookmarked ? (
                <svg
                  data-slot="icon"
                  fill="none"
                  strokeWidth="2.25"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                  className="size-5 text-gray-600 absolute top-5 right-5 z-10"
                  onClick={(e) => handleBookmarkToggle(e, route)}
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
                  className="size-5 text-blue-500 absolute top-5 right-5 z-10"
                  onClick={(e) => handleBookmarkToggle(e, route)}
                >
                  <path
                    clipRule="evenodd"
                    fillRule="evenodd"
                    d="M10 2c-1.716 0-3.408.106-5.07.31C3.806 2.45 3 3.414 3 4.517V17.25a.75.75 0 0 0 1.075.676L10 15.082l5.925 2.844A.75.75 0 0 0 17 17.25V4.517c0-1.103-.806-2.068-1.93-2.207A41.403 41.403 0 0 0 10 2Z"
                  ></path>
                </svg>
              )}

              <figure className="relative overflow-hidden aspect-[4/3]">
                <ImageWithSkeleton
                  src={route.routeImgId}
                  alt={route.routeName}
                />
              </figure>
              <div className="ml-1">
                <div className="font-semibold mt-2">{route.routeName}</div>
                <div className="flex text-xs text-gray-500 gap-2">
                  <span>{route.distance}km</span>
                  <span>{route.altitude}m</span>
                  <span>좋아요 {route.likeCount}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      {isLoading && showLoader && (
        <div className="flex w-full justify-center mt-4">
          <div className="loading loading-dots loading-lg"></div>
        </div>
      )}
      {!isLoading && hasMore && (
        <button
          className="btn btn-wide mt-4 mx-auto no-animation"
          onClick={handleLoadMore}
        >
          더보기
        </button>
      )}
      {isLastPage && (
        <div className="text-center text-gray-400 mt-4 mb-10">
          마지막 페이지입니다.
        </div>
      )}
    </div>
  );
}

export default RouteList;
