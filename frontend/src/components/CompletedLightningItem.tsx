import { Link } from "react-router-dom";
import { MyLightningResponse } from "../services/userDetailService";
import ImageWithSkeleton from "./ImageWithSkeleton";
import ReviewModal from "./ReviewModal";

interface CompletedLightningItemProps {
  lightning: MyLightningResponse;
  disableOuterLink?: boolean;
}

function CompletedLightningItem({
  lightning,
  disableOuterLink,
}: CompletedLightningItemProps) {
  // 날짜 포멧팅
  const formatDate = (date: string) => {
    const options: Intl.DateTimeFormatOptions = {
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: false, // 24시간 포맷
    };

    return new Date(date)
      .toLocaleString("ko-KR", options)
      .replace("오전", "")
      .replace("오후", "");
  };

  // 렌더링할 때 태그 길이 제한
  const displayTags = lightning.tags.tags.slice(0, 3);
  const hasMoreTags = lightning.tags.tags.length > 3;

  return (
    <div className="w-full border rounded-lg mb-4 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {disableOuterLink ? (
        <div className="bg-base-100 w-full">
          <div className="flex items-center p-4">
            <figure className="size-40 flex items-center justify-center relative mr-4">
              <ImageWithSkeleton
                src={lightning.lightning.lightningId.toString()}
                alt={lightning.lightning.title}
              />
            </figure>
            <div className="flex flex-col flex-1">
              <div className="flex flex-col">
                <div className="text-xs text-gray-500">
                  {formatDate(lightning.lightning.eventDate)} (
                  {lightning.lightning.duration}분)
                </div>
                <div className="text-lg font-semibold">
                  {lightning.lightning.title}
                </div>
                <div className="text-sm text-gray-500 flex items-center gap-1">
                  <svg
                    data-slot="icon"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                    className="size-4"
                  >
                    <path
                      clipRule="evenodd"
                      fillRule="evenodd"
                      d="m9.69 18.933.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 0 0 .281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 1 0 3 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 0 0 2.273 1.765 11.842 11.842 0 0 0 .976.544l.062.029.018.008.006.003ZM10 11.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z"
                    ></path>
                  </svg>
                  {lightning.lightning.address || "주소 정보 없음"}
                </div>
                <div className="text-sm text-gray-500 flex items-center gap-1">
                  <svg
                    data-slot="icon"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                    className="size-4"
                  >
                    <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z"></path>
                  </svg>
                  {lightning.users.length}/{lightning.lightning.capacity}명
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {displayTags.map((tag, index) => (
                    <div
                      key={index}
                      className="badge badge-primary badge-outline text-xs"
                    >
                      {tag}
                    </div>
                  ))}
                  {hasMoreTags && (
                    <div className="badge badge-primary badge-outline text-xs">
                      +{lightning.tags.tags.length - 3}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 액션 버튼 - 더 깔끔한 레이아웃으로 변경 */}
          <div className="flex p-4 bg-base-100 border-t">
            <button
              className="btn btn-sm btn-outline no-animation"
              onClick={() =>
                (
                  document.getElementById("review-modal") as HTMLDialogElement
                )?.showModal()
              }
            >
              리뷰 등록
            </button>
            <button className="btn btn-sm btn-primary no-animation">
              스트라바 등록
            </button>
            <Link to={`/lightning/${lightning.lightning.lightningId}`}>
              <button className="btn btn-sm btn-ghost no-animation">
                상세보기
              </button>
            </Link>
          </div>
        </div>
      ) : (
        <div>
          <Link to={`/lightning/${lightning.lightning.lightningId}`}>
            <div className="bg-base-100 w-full">
              <div className="flex items-center p-4">
                <figure className="size-40 flex items-center justify-center relative mr-4">
                  <ImageWithSkeleton
                    src={lightning.lightning.lightningId.toString()}
                    alt={lightning.lightning.title}
                  />
                </figure>
                <div className="flex flex-col flex-1">
                  <div className="flex flex-col">
                    <div className="text-xs text-gray-500">
                      {formatDate(lightning.lightning.eventDate)} (
                      {lightning.lightning.duration}분)
                    </div>
                    <div className="text-lg font-semibold">
                      {lightning.lightning.title}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <svg
                        data-slot="icon"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                        className="size-4"
                      >
                        <path
                          clipRule="evenodd"
                          fillRule="evenodd"
                          d="m9.69 18.933.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 0 0 .281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 1 0 3 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 0 0 2.273 1.765 11.842 11.842 0 0 0 .976.544l.062.029.018.008.006.003ZM10 11.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z"
                        ></path>
                      </svg>
                      {lightning.lightning.address || "주소 정보 없음"}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <svg
                        data-slot="icon"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                        className="size-4"
                      >
                        <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z"></path>
                      </svg>
                      {lightning.users.length}/{lightning.lightning.capacity}명
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {displayTags.map((tag, index) => (
                        <div
                          key={index}
                          className="badge badge-primary badge-outline text-xs"
                        >
                          {tag}
                        </div>
                      ))}
                      {hasMoreTags && (
                        <div className="badge badge-primary badge-outline text-xs">
                          +{lightning.tags.tags.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* 액션 버튼 - 더 깔끔한 레이아웃으로 변경 */}
            <div className="flex p-4 bg-base-100 border-t">
            <button
              className="btn btn-sm btn-outline no-animation"
              onClick={() =>
                (
                  document.getElementById("review-modal") as HTMLDialogElement
                )?.showModal()
              }
            >
              리뷰 등록
            </button>
            <button className="btn btn-sm btn-primary no-animation">
              스트라바 등록
            </button>
          </div>
        </div>
      )}

      {/* 모달 */}
      <ReviewModal lightning={lightning} modalId="review-modal" />
    </div>
  );
}

export default CompletedLightningItem;
