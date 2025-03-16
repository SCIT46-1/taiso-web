import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ImageWithSkeleton from "./ImageWithSkeleton";
import userDetailService, {
  MyLightningResponse,
} from "../services/userDetailService";
import ReviewModal from "./ReviewModal";
import stravaService, { StravaActivity } from "../services/stravaService";
import StravaModal from "./StravaModal";

function UserCompletedLightningList() {
  const [completedLightning, setCompletedLightning] = useState<
    MyLightningResponse[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isStravaConnected, setIsStravaConnected] = useState<boolean>(false);
  const [checkingStravaConnection, setCheckingStravaConnection] =
    useState<boolean>(true);
  const [lightningStravaStatus, setLightningStravaStatus] = useState<{
    [key: number]: boolean;
  }>({});
  const [lightningStravaData, setLightningStravaData] = useState<{
    [key: number]: StravaActivity;
  }>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await userDetailService.getMyCompletedLightning();
        setCompletedLightning(data);
        setError(null);
      } catch (error) {
        console.error(error);
        setError("완료된 라이트닝 정보를 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [refreshKey]);

  useEffect(() => {
    const checkStravaConnection = async () => {
      try {
        const data = await stravaService.getStravaActivities(1, 1);
        console.log(data);
        setIsStravaConnected(true);
      } catch (error) {
        console.error("Strava not connected:", error);
        setIsStravaConnected(false);
      } finally {
        setCheckingStravaConnection(false);
      }
    };

    checkStravaConnection();
  }, [refreshKey]);

  useEffect(() => {
    const checkLightningStravaConnection = async () => {
      if (!isStravaConnected || completedLightning.length === 0) return;

      const statusMap: { [key: number]: boolean } = {};
      const dataMap: { [key: number]: StravaActivity } = {};

      for (const lightning of completedLightning) {
        try {
          const lightningId = lightning.lightning.lightningId;
          const activityData = await stravaService.getUserLightningActivity(
            lightningId
          );

          if (activityData && Object.keys(activityData).length > 0) {
            statusMap[lightningId] = true;
            dataMap[lightningId] = activityData;
          } else {
            statusMap[lightningId] = false;
          }
        } catch (error) {
          console.error("Failed to check lightning Strava status:", error);
          statusMap[lightning.lightning.lightningId] = false;
        }
      }

      setLightningStravaStatus(statusMap);
      setLightningStravaData(dataMap);
    };

    checkLightningStravaConnection();
  }, [completedLightning, isStravaConnected, refreshKey]);

  const formatTime = (date: string | number | Date) => {
    const dateObj = new Date(date);
    const hours = dateObj.getHours();
    const minutes = dateObj.getMinutes().toString().padStart(2, "0");

    return `${hours}:${minutes}`;
  };

  const formatDate = (date: string | number | Date) => {
    const dateObj = new Date(date);
    const month = dateObj.getMonth() + 1;
    const day = dateObj.getDate();

    return `${month}월 ${day}일`;
  };

  const groupByDate = (items: MyLightningResponse[]) => {
    const groups: { [key: string]: MyLightningResponse[] } = {};

    items.forEach((item) => {
      const dateObj = new Date(item.lightning.eventDate);
      const dateKey = `${dateObj.getFullYear()}-${
        dateObj.getMonth() + 1
      }-${dateObj.getDate()}`;

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }

      groups[dateKey].push(item);
    });

    return Object.entries(groups)
      .sort(
        ([dateA], [dateB]) =>
          new Date(dateA).getTime() - new Date(dateB).getTime()
      )
      .map(([date, lightnings]) => ({
        date,
        formattedDate: formatDate(date),
        lightnings,
      }));
  };

  const groupedLightnings = groupByDate(completedLightning);

  const handleStravaLinkSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleStravaConnect = async () => {
    try {
      const url = await stravaService.getStravaLink();
      window.location.href = url;
    } catch (error) {
      console.error("Error getting Strava link:", error);
    }
  };

  const StravaInfoModal = ({
    lightningId,
    modalId,
  }: {
    lightningId: number;
    modalId: string;
  }) => {
    const stravaData = lightningStravaData[lightningId];

    return (
      <dialog id={modalId} className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">스트라바 활동 정보</h3>

          {stravaData ? (
            <div className="flex flex-col gap-2">
              <div className="flex justify-between">
                <span className="font-semibold">활동명:</span>
                <span>{stravaData.name || "정보 없음"}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">거리:</span>
                <span>
                  {stravaData.distance !== undefined
                    ? `${(stravaData.distance / 1000).toFixed(2)} km`
                    : "정보 없음"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">시간:</span>
                <span>
                  {stravaData.moving_time
                    ? `${Math.floor(stravaData.moving_time / 60)}분 ${
                        stravaData.moving_time % 60
                      }초`
                    : "정보 없음"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">평균 속도:</span>
                <span>
                  {stravaData.average_speed
                    ? `${(stravaData.average_speed * 3.6).toFixed(1)} km/h`
                    : "정보 없음"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">고도 상승:</span>
                <span>
                  {stravaData.total_elevation_gain
                    ? `${stravaData.total_elevation_gain}m`
                    : "정보 없음"}
                </span>
              </div>
              {stravaData.start_date && (
                <div className="flex justify-between">
                  <span className="font-semibold">날짜:</span>
                  <span>
                    {new Date(stravaData.start_date).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              스트라바 활동 정보를 불러올 수 없습니다.
            </div>
          )}

          <div className="modal-action">
            <form method="dialog">
              <button className="btn">닫기</button>
            </form>
          </div>
        </div>
      </dialog>
    );
  };

  const renderStravaButton = (lightningId: number) => {
    if (checkingStravaConnection) {
      return (
        <button
          className="btn btn-outline btn-primary md:w-[150px] w-full no-animation"
          disabled
        >
          <span className="loading loading-spinner loading-xs"></span>
        </button>
      );
    }

    if (!isStravaConnected) {
      return (
        <button
          className="btn btn-outline btn-primary md:w-[150px] w-full no-animation"
          onClick={handleStravaConnect}
        >
          스트라바 연동
        </button>
      );
    }

    const hasActivity = lightningStravaStatus[lightningId];
    if (hasActivity) {
      return (
        <button
          className="btn btn-outline btn-success md:w-[150px] w-full no-animation"
          onClick={() =>
            (
              document.getElementById(
                `strava-info-modal-${lightningId}`
              ) as HTMLDialogElement
            )?.showModal()
          }
        >
          등록 정보보기
        </button>
      );
    } else {
      return (
        <button
          className="btn btn-outline btn-primary md:w-[150px] w-full no-animation"
          onClick={() =>
            (
              document.getElementById(
                `strava-modal-${lightningId}`
              ) as HTMLDialogElement
            )?.showModal()
          }
        >
          스트라바 등록
        </button>
      );
    }
  };

  const renderStravaModals = (lightningId: number) => {
    if (!isStravaConnected) return null;

    const hasActivity = lightningStravaStatus[lightningId];

    if (hasActivity) {
      return (
        <StravaInfoModal
          lightningId={lightningId}
          modalId={`strava-info-modal-${lightningId}`}
        />
      );
    } else {
      return (
        <StravaModal
          modalId={`strava-modal-${lightningId}`}
          lightningId={lightningId}
          onSuccess={handleStravaLinkSuccess}
        />
      );
    }
  };

  return (
    <div className="flex flex-col">
      {error && (
        <div className="alert alert-error shadow-lg mb-4">
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current flex-shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center my-20">
          <div className="loading loading-dots loading-lg"></div>
        </div>
      ) : (
        <div className="flex flex-col mt-4">
          {completedLightning.length === 0 ? (
            <div className="text-center text-gray-500 my-20">
              완료된 번개 모임이 없습니다.
            </div>
          ) : (
            groupedLightnings.map((group, groupIndex) => (
              <div key={groupIndex} className="mb-6 ">
                <div className="text-lg font-semiold p-2 border-b-[3px] border-gray-300 w-[87%] mx-auto">
                  {group.formattedDate}
                </div>
                <div className="flex flex-col items-center">
                  {group.lightnings.map((lightning, index) => (
                    <div key={index} className="w-[90%] relative">
                      <div className="md:flex block">
                        <Link
                          to={`/lightning/${lightning.lightning.lightningId}`}
                          className="flex-1 group"
                        >
                          <div className="bg-base-100 w-full md:flex block items-center">
                            <figure className="size-40 flex items-center justify-center md:ml-4 mx-auto md:mx-0 relative overflow-hidden my-2 md:my-0">
                              <ImageWithSkeleton
                                src={
                                  lightning.lightning.routeImgId
                                    ? `${lightning.lightning.routeImgId}`
                                    : ""
                                }
                                alt={lightning.lightning.title}
                              />
                            </figure>
                            <div className="flex flex-col p-2 md:ml-6 md:text-left text-center">
                              <div className="flex flex-col">
                                <div className="text-base font-bold">
                                  {formatTime(lightning.lightning.eventDate)} (
                                  {lightning.lightning.duration}분)
                                </div>
                                <div className="text-base">
                                  {lightning.lightning.title}
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
                                    {lightning.lightning.address}
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
                                  {lightning.lightning.currentParticipants} /{" "}
                                  {lightning.lightning.capacity}
                                </div>
                                <div className="flex flex-wrap gap-1 mt-2 md:justify-start justify-center">
                                  {lightning.tags.tags.map((tag, tagIndex) => (
                                    <div
                                      key={tagIndex}
                                      className="badge badge-primary badge-outline"
                                    >
                                      {tag}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>

                        <div className="p-4 flex items-center justify-center md:mt-auto md:ml-0 mt-0 ml-auto md:flex-col gap-2">
                          <button
                            className="btn btn-outline btn-secondary md:w-[150px] w-full no-animation"
                            onClick={() =>
                              (
                                document.getElementById(
                                  `review-modal-${lightning.lightning.lightningId}`
                                ) as HTMLDialogElement
                              )?.showModal()
                            }
                          >
                            리뷰 등록
                          </button>

                          {renderStravaButton(lightning.lightning.lightningId)}
                        </div>
                      </div>

                      <ReviewModal
                        lightning={lightning}
                        modalId={`review-modal-${lightning.lightning.lightningId}`}
                      />

                      {renderStravaModals(lightning.lightning.lightningId)}

                      {index < group.lightnings.length - 1 && (
                        <div className="divider w-full -my-2"></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default UserCompletedLightningList;
