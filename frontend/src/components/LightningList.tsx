import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
// 데이터 불러오기
import lightningService, { Lightning } from "../services/lightningService";
// 이미지 요청 관련
import ImageWithSkeleton from "./ImageWithSkeleton";
import bookmarkService from "../services/bookmarkService";

interface LightningListProps {
  sort: string;
  gender: string;
  bikeType: string;
  level: string;
  region: string;
  tags: string[];
  selectedDate: Date;
}

function LightningList({
  sort,
  gender,
  bikeType,
  level,
  region,
  tags,
  selectedDate,
}: LightningListProps) {
  const PAGE_SIZE = 8;
  // 로딩값
  const [isLoading, setIsLoading] = useState(false);
  const [showLoader, setShowLoader] = useState(false); // Add state for delayed loader
  const [lightningList, setLightningList] = useState<Lightning[]>([]);
  // 페이지 관련 변경 값
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLastPage, setIsLastPage] = useState(false);

  const navigate = useNavigate();

  // sort prop이 바뀌면 페이지와 목록을 초기화
  useEffect(() => {
    setPage(0);
    setLightningList([]);
    setHasMore(true);
  }, [sort, gender, bikeType, level, region, tags, selectedDate]);

  // 비동기 데이터 불러오기
  const fetchLightningList = async () => {
    let loaderTimer: NodeJS.Timeout | null = null;

    try {
      setIsLoading(true);

      // Set a timer to show loader after 300ms if the request is still ongoing
      loaderTimer = setTimeout(() => {
        setShowLoader(true);
      }, 300);

      //날짜 포메팅하고 일 까지만 반환
      const formattedDate = selectedDate.toLocaleDateString("en-CA", {
        timeZone: "Asia/Seoul",
      });
      const data = await lightningService.getLightningList(
        page,
        PAGE_SIZE,
        sort,
        gender,
        bikeType,
        level,
        region,
        tags,
        formattedDate
      );
      setIsLastPage(data.last);
      setLightningList((prev) =>
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
      // Clear the timer if it exists
      if (loaderTimer) {
        clearTimeout(loaderTimer);
      }
      setIsLoading(false);
      setShowLoader(false);
    }
  };

  // 페이지 번호나 필터가 변경될 때마다 데이터를 다시 불러옴
  useEffect(() => {
    fetchLightningList();
  }, [page, sort, gender, bikeType, level, region, tags, selectedDate]);

  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
  };

  // 날짜 포멧팅
  const formatDate = (date: string | number | Date) => {
    const dateObj = new Date(date);
    const hours = dateObj.getHours();
    const minutes = dateObj.getMinutes().toString().padStart(2, "0");

    return `${hours}:${minutes}`;
  };

  const renderStatusButton = (status: string) => {
    switch (status) {
      case "모집":
        return (
          <button className="btn btn-outline btn-primary md:w-[150px] w-full no-animation">
            참가
          </button>
        );
      case "마감":
        return (
          <button
            className="btn btn-outline btn-error md:w-[150px] w-full no-animation"
            disabled
          >
            마감
          </button>
        );
      case "강제마감":
        return (
          <button
            className="btn btn-outline btn-error md:w-[150px] w-full no-animation"
            disabled
          >
            마감
          </button>
        );
      case "종료":
      default:
        return (
          <button
            className="btn btn-outline btn-error md:w-[150px] w-full no-animation"
            disabled
          >
            종료
          </button>
        );
    }
  };

  // Add function to handle bookmark toggle
  const handleBookmarkToggle = async (
    e: React.MouseEvent,
    lightning: Lightning
  ) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      if (!lightning.bookmarked) {
        await bookmarkService.bookmarkLightning(lightning.lightningId);
      } else {
        await bookmarkService.deleteBookmarkLightning(lightning.lightningId);
      }

      // Update the local state to reflect the change
      setLightningList((prevList) =>
        prevList.map((item) =>
          item.lightningId === lightning.lightningId
            ? { ...item, bookmarked: !item.bookmarked }
            : item
        )
      );
    } catch (error) {
      console.error("Bookmark operation failed:", error);

      // Check if it's a 401 error
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
    <div className="flex flex-col">
      <div className="flex flex-wrap justify-center gap-2 mt-4">
        {lightningList.length === 0 && !isLoading ? (
          <div className="text-center text-gray-500 my-20">
            일치하는 번개 모임이 없습니다.
          </div>
        ) : (
          lightningList.map((lightning) => (
            <div key={lightning.lightningId} className="w-[90%] relative">
              <div className="md:flex block">
                <Link
                  to={`/lightning/${lightning.lightningId}`}
                  className="flex-1 group"
                >
                  <div className="bg-base-100 w-full md:flex block items-center justify-center">
                    <div className="text-base flex flex-col items-center px-3 mr-4 text-center">
                      <span className="text-xl">{formatDate(lightning.eventDate)}</span>
                      <span className="text-xs">({lightning.duration}분)</span>
                    </div>

                      <figure className="size-40 flex items-center justify-center">
                        <ImageWithSkeleton
                          src={lightning.routeImgId}
                          alt={lightning.title}
                        />
                      </figure>
                    
                    <div className="flex flex-col p-2 md:ml-6 md:text-left text-center">
                      <div className="flex flex-col">
                        <div className="text-base font-semibold truncate md:w-[350px] w-full text-overflow-ellipsis overflow-hidden mb-1">
                          {lightning.title}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-1 md:justify-start justify-center">
                          <svg
                            data-slot="icon"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                            aria-hidden="true"
                            className="size-4 flex-shrink-0"
                          >
                            <path
                              clipRule="evenodd"
                              fillRule="evenodd"
                              d="m9.69 18.933.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 0 0 .281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 1 0 3 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 0 0 2.273 1.765 11.842 11.842 0 0 0 .976.544l.062.029.018.008.006.003ZM10 11.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z"
                            ></path>
                          </svg>
                          <span className="md:truncate md:max-w-none max-w-[180px] truncate">
                            {lightning.address}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-1 md:justify-start justify-center">
                          <svg
                            data-slot="icon"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                            aria-hidden="true"
                            className="size-4 flex-shrink-0"
                          >
                            <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z"></path>
                          </svg>
                          {lightning.currentParticipants}/{lightning.capacity}명
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2 md:justify-start justify-center">
                          <div className="badge badge-primary badge-outline">
                            {lightning.gender}
                          </div>
                          <div className="badge badge-primary badge-outline">
                            {lightning.level}
                          </div>
                          <div className="badge badge-primary badge-outline">
                            {lightning.bikeType}
                          </div>
                          {lightning.tags.map((tag, index) => (
                            <div
                              key={index}
                              className="badge badge-primary badge-outline"
                            >
                              {tag}
                            </div>
                          ))}
                        </div>
                        {/* 북마크 아이콘 */}
                        {!lightning.bookmarked ? (
                          <svg
                            data-slot="icon"
                            fill="none"
                            strokeWidth="1.75"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                            aria-hidden="true"
                            className="size-7 text-blue-500 absolute top-3 right-5 z-10"
                            onClick={(e) => handleBookmarkToggle(e, lightning)}
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
                            className="size-7 text-blue-500 absolute top-3 right-5 z-10"
                            onClick={(e) => handleBookmarkToggle(e, lightning)}
                          >
                            <path
                              clip-rule="evenodd"
                              fill-rule="evenodd"
                              d="M10 2c-1.716 0-3.408.106-5.07.31C3.806 2.45 3 3.414 3 4.517V17.25a.75.75 0 0 0 1.075.676L10 15.082l5.925 2.844A.75.75 0 0 0 17 17.25V4.517c0-1.103-.806-2.068-1.93-2.207A41.403 41.403 0 0 0 10 2Z"
                            ></path>
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>

                <div className="p-4 flex items-center justify-center md:mt-auto md:ml-0 mt-0 ml-auto">
                  <Link
                    to={`/lightning/${lightning.lightningId}`}
                    className="group w-full md:w-auto"
                  >
                    {renderStatusButton(lightning.status)}
                  </Link>
                </div>
              </div>
              <div className="divider w-full -my-2"></div>
            </div>
          ))
        )}
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
      {isLastPage && lightningList.length > 0 && (
        <div className="text-center text-gray-400 mt-4 mb-10">
          마지막 페이지입니다.
        </div>
      )}
    </div>
  );
}

export default LightningList;
