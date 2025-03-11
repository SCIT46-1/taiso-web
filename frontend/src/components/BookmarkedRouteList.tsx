import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import bookmarkService, {
  BookmarkRoutesResponse,
} from "../services/bookmarkService";
import ImageWithSkeleton from "./ImageWithSkeleton";
import routeService from "../services/routeService";

function BookmarkedRouteList() {
  const [isLoading, setIsLoading] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [bookmarkRoutes, setBookmarkRoutes] = useState<
    BookmarkRoutesResponse[]
  >([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookmarkRoutes = async () => {
      let loaderTimer: NodeJS.Timeout | null = null;

      try {
        setIsLoading(true);
        // 요청이 300ms 이상 걸리면 loader 표시
        loaderTimer = setTimeout(() => {
          setShowLoader(true);
        }, 300);

        const data = await bookmarkService.getBookmarkRoutes();
        setBookmarkRoutes(data);
      } catch (error) {
        console.error(error);
        // 401 에러 체크 (인증 필요)
        if (
          error instanceof Error &&
          "response" in (error as any) &&
          (error as any).response?.status === 401
        ) {
          navigate("/auth/landing");
        }
      } finally {
        if (loaderTimer) {
          clearTimeout(loaderTimer);
        }
        setIsLoading(false);
        setShowLoader(false);
      }
    };

    fetchBookmarkRoutes();
  }, [navigate]);

  // 북마크 토글 처리 함수만 유지하고 좋아요 함수는 제거
  const handleBookmarkToggle = async (
    e: React.MouseEvent,
    route: BookmarkRoutesResponse
  ) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await bookmarkService.deleteBookmarkRoute(route.bookmarkedRouteId);

      // 로컬 상태에서 삭제된 북마크 제거
      setBookmarkRoutes((prevList) =>
        prevList.filter(
          (item) => item.bookmarkedRouteId !== route.bookmarkedRouteId
        )
      );
    } catch (error) {
      console.error("Bookmark operation failed:", error);

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
      {bookmarkRoutes?.length === 0 && !isLoading ? (
        <div className="text-center my-10 text-gray-500">
          북마크한 루트가 없습니다.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-">
          {bookmarkRoutes?.map((route) => (
            <Link
              to={`/route/${route.routeId}`}
              key={route.routeId}
              className="group"
            >
              <div className="bg-base-100 w-full cursor-pointer p-3 rounded-2xl relative">
                {/* 좋아요 아이콘 삭제됨 */}

                {/* 북마크 아이콘 (북마크 페이지이므로 항상 채워진 아이콘) */}
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
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {isLoading && showLoader && (
        <div className="flex w-full justify-center mt-4">
          <div className="loading loading-dots loading-lg"></div>
        </div>
      )}
    </div>
  );
}

export default BookmarkedRouteList;
