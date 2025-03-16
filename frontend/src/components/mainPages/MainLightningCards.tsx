import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import lightningService, { Lightning } from "../../services/lightningService";
import ImageWithSkeleton from "../ImageWithSkeleton";

function MainLightningCards() {
  const [lightningList, setLightningList] = useState<Lightning[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchMainLightnings = async () => {
      setIsLoading(true);
      try {
        const response = await lightningService.getMainLightnings();
        setLightningList(response.content || response);
      } catch (error) {
        console.error("Failed to fetch main lightnings:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMainLightnings();
  }, []);

  // 날짜 포멧팅
  const formatDate = (date: string | number | Date) => {
    const dateObj = new Date(date);
    const hours = dateObj.getHours();
    const minutes = dateObj.getMinutes().toString().padStart(2, "0");

    return `${hours}:${minutes}`;
  };

  // 북마크 토글 처리
  // const handleBookmarkToggle = async (
  //   e: React.MouseEvent,
  //   lightning: Lightning
  // ) => {
  //   e.preventDefault();
  //   e.stopPropagation();

  //   try {
  //     if (!lightning.bookmarked) {
  //       await bookmarkService.bookmarkLightning(lightning.lightningId);
  //     } else {
  //       await bookmarkService.deleteBookmarkLightning(lightning.lightningId);
  //     }

  //     // 상태 업데이트
  //     setLightningList((prevList) =>
  //       prevList.map((item) =>
  //         item.lightningId === lightning.lightningId
  //           ? { ...item, bookmarked: !item.bookmarked }
  //           : item
  //       )
  //     );
  //   } catch (error) {
  //     console.error("Bookmark operation failed:", error);
  //     if (
  //       error instanceof Error &&
  //       "response" in (error as any) &&
  //       (error as any).response?.status === 401
  //     ) {
  //       navigate("/auth/landing");
  //     }
  //   }
  // };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="loading loading-dots loading-lg"></div>
      </div>
    );
  }

  return (
    <div className="w-full mt-2">
      {lightningList.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          표시할 번개 모임이 없습니다.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {lightningList.map((lightning) => (
            <Link
              key={lightning.lightningId}
              to={`/lightning/${lightning.lightningId}`}
              className="block group"
            >
              <div className="flex gap-4 transition-all duration-200 p- rounded-lg p-2 items-center">
                {/* 이미지 */}
                <div className="w-36 flex-shrink-0 relative overflow-hidden rounded-lg">
                  <ImageWithSkeleton
                    src={lightning.routeImgId}
                    alt={lightning.title}
                    className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                {/* 컨텐츠 */}
                <div className="flex flex-col">
                  <div className="font-semibold">
                    {formatDate(lightning.eventDate)} ({lightning.duration}분)
                  </div>
                  <div className="font-medium line-clamp-1">
                    {lightning.title}
                  </div>

                  {/* 위치 */}
                  <div className="flex items-center text-sm text-gray-500">
                    <svg
                      data-slot="icon"
                      fill="grey"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                      className="size-4 mr-1"
                    >
                      <path
                        clipRule="evenodd"
                        fillRule="evenodd"
                        d="m9.69 18.933.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 0 0 .281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 1 0 3 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 0 0 2.273 1.765 11.842 11.842 0 0 0 .976.544l.062.029.018.008.006.003ZM10 11.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z"
                      ></path>
                    </svg>
                    <span className="truncate">{lightning.address}</span>
                  </div>

                  {/* 인원 */}
                  <div className="flex items-center text-sm text-gray-500 ">
                    <svg
                      data-slot="icon"
                      fill="grey"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                      className="size-4 mr-1"
                    >
                      <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z"></path>
                    </svg>
                    <span>
                      {lightning.currentParticipants}/{lightning.capacity}명
                    </span>
                  </div>

                  {/* 태그 */}
                  <div className="flex flex-wrap gap-1 mt-1">
                    <div className="badge badge-outline badge-primary">
                      {lightning.gender}
                    </div>
                    <div className="badge badge-outline badge-primary">
                      {lightning.level}
                    </div>
                    <div className="badge badge-outline badge-primary">
                      {lightning.bikeType}
                    </div>
                    {lightning.tags.map((tag, index) => (
                      <div
                        key={index}
                        className="badge badge-outline badge-primary"
                      >
                        {tag}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default MainLightningCards;

// //메인 페이지 번개 조회
// const getMainLightnings = async (): Promise<LightningListResponse> => {
//   return await get(`/lightnings/main`);
// };
