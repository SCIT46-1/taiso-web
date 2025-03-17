import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import bookmarkService, {
  BookmarkLightningsResponse,
} from "../services/bookmarkService";
import ImageWithSkeleton from "./ImageWithSkeleton";

function BookmarkLightningList() {
  const [bookmarkLightnings, setBookmarkLightnings] = useState<
    BookmarkLightningsResponse[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookmarkLightnings = async () => {
      try {
        const data = await bookmarkService.getBookmarkLightnings();
        setBookmarkLightnings(data);
      } catch (error) {
        console.error("Failed to fetch bookmarked lightnings:", error);
        // If unauthorized, redirect to login
        if (
          error instanceof Error &&
          "response" in (error as any) &&
          (error as any).response?.status === 401
        ) {
          navigate("/auth/landing");
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchBookmarkLightnings();
  }, [navigate]);

  // 날짜 포멧팅
  const formatDate = (date: string | number | Date) => {
    const dateObj = new Date(date);

    const month = dateObj.getMonth() + 1; // getMonth() returns 0-11
    const day = dateObj.getDate();
    const hours = dateObj.getHours();
    const minutes = dateObj.getMinutes().toString().padStart(2, "0");

    return `${month}월 ${day}일 ${hours}:${minutes}`;
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

  // 북마크 삭제 핸들러
  const handleRemoveBookmark = async (
    e: React.MouseEvent,
    lightningId: number
  ) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await bookmarkService.deleteBookmarkLightning(lightningId);
      setBookmarkLightnings((prevState) =>
        prevState.filter((lightning) => lightning.lightningId !== lightningId)
      );
    } catch (error) {
      console.error("Failed to remove bookmark:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="loading loading-dots loading-lg"></div>
      </div>
    );
  }

  if (bookmarkLightnings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 p-4">
        <div className="text-lg font-medium mb-2">
          북마크한 번개 모임이 없습니다
        </div>
        <p className="text-gray-500 text-center">
          관심있는 번개 모임을 북마크해보세요!
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex flex-wrap justify-center gap-2">
        {bookmarkLightnings.map((lightning) => (
          <div key={lightning.lightningId} className="w-[90%] relative">
            <div className="md:flex block">
              <Link
                to={`/lightning/${lightning.lightningId}`}
                className="flex-1 group"
              >
                <div className="bg-base-100 w-full md:flex block items-center">
                  <figure className="size-40 flex items-center justify-center md:ml-4 mx-auto md:mx-0 relative overflow-hidden my-2 md:my-0">
                    <ImageWithSkeleton
                      src={lightning.routeImgId}
                      alt={lightning.title}
                    />
                  </figure>
                  <div className="flex flex-col p-2 md:ml-6 md:text-left text-center">
                    <div className="flex flex-col">
                      <div className="text-base font-bold">
                        {formatDate(lightning.eventDate)} ({lightning.duration}
                        분)
                      </div>
                      <div className="text-base truncate md:w-[350px] w-full text-overflow-ellipsis overflow-hidden">
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
                      <div className="flex flex-wrap gap-1 mt-2 md:justify-start justify-center max-w-[400px]">
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
                      {/* 북마크 제거 아이콘 */}
                      <svg
                        data-slot="icon"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                        className="size-7 text-blue-500 absolute top-3 right-5 z-10 cursor-pointer"
                        onClick={(e) =>
                          handleRemoveBookmark(e, lightning.lightningId)
                        }
                      >
                        <path
                          clipRule="evenodd"
                          fillRule="evenodd"
                          d="M10 2c-1.716 0-3.408.106-5.07.31C3.806 2.45 3 3.414 3 4.517V17.25a.75.75 0 0 0 1.075.676L10 15.082l5.925 2.844A.75.75 0 0 0 17 17.25V4.517c0-1.103-.806-2.068-1.93-2.207A41.403 41.403 0 0 0 10 2Z"
                        ></path>
                      </svg>
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
        ))}
      </div>
    </div>
  );
}

export default BookmarkLightningList;
