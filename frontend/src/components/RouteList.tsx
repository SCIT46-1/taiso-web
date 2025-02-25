import { useEffect, useState } from "react";
import routeService, { RouteListResponse } from "../services/routeService";
import { Link, useNavigate } from "react-router-dom";
import ImageWithSkeleton from "./ImageWithSkeleton";

function RouteList() {
  const PAGE_SIZE = 8;
  const [isLoading, setIsLoading] = useState(false);
  const [routeList, setRouteList] = useState<RouteListResponse[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // 필터 상태들 (필요에 따라 업데이트)
  const [sort, setSort] = useState("");
  const [isLastPage, setIsLastPage] = useState(false);
  const [distanceType, setDistanceType] = useState("");
  const [altitudeType, setAltitudeType] = useState("");
  const [roadType, setRoadType] = useState("");
  const [tag, setTag] = useState([]);

  const navigate = useNavigate();

  const fetchRouteList = async () => {
    try {
      setIsLoading(true);
      const data = await routeService.getRouteList(
        page,
        PAGE_SIZE,
        sort,
        distanceType,
        altitudeType,
        roadType,
        tag
      );
      setIsLastPage(data.last);
      // 페이지 0일 때는 초기화, 그렇지 않으면 기존 데이터에 추가
      setRouteList((prev) =>
        page === 0 ? data.content : [...prev, ...data.content]
      );
      // 반환된 항목 수가 PAGE_SIZE보다 작으면 더 이상 불러올 데이터 없음
      if (data.content.length < PAGE_SIZE) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
    } catch (err) {
      navigate("/error");
    } finally {
      setIsLoading(false);
    }
  };

  // 페이지 번호나 필터가 변경될 때마다 데이터를 다시 불러옴
  useEffect(() => {
    fetchRouteList();
  }, [page, sort, distanceType, altitudeType, roadType, tag]);

  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
  };

  // 예: 필터 변경 시 페이지를 초기화하고 기존 목록을 지워 새로 불러옴 (필요한 경우)
  const handleFilterChange = (newSort: string) => {
    setSort(newSort);
    setPage(0);
    setRouteList([]);
  };

  return (
    <div className="flex flex-col ">
      <div className="flex justify-start mb-4 gap-2">
        <div className="badge badge-primary badge-outline badge-lg text-sm cursor-pointer hover:bg-primary hover:text-white">
          랭킹순
        </div>
        <div className="badge badge-primary badge-outline badge-lg text-sm cursor-pointer hover:bg-primary hover:text-white">
          최신순
        </div>
        <div className="badge badge-primary badge-outline badge-lg text-sm cursor-pointer hover:bg-primary hover:text-white">
          태그
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {routeList.map((route) => (
          <Link
            to={`/route/${route.routeId}`}
            key={route.routeId}
            className="group"
          >
            <div className="bg-base-100 w-60 cursor-pointer hover:bg-base-200 p-3 rounded-2xl relative">
              <svg
                data-slot="icon"
                fill="none"
                stroke-width="2.25"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                className="size-5 text-gray-600 absolute top-5 right-11 z-10"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log("delete");
                }}
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                ></path>
              </svg>
              <svg
                data-slot="icon"
                fill="none"
                strokeWidth="2.25"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                className="size-5 text-gray-600 absolute top-5 right-5 z-10"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log("delete");
                }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"
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
      {isLoading && (
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
