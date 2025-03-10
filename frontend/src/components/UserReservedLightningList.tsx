import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MyLightningResponse } from "../services/userDetailService";
import ImageWithSkeleton from "./ImageWithSkeleton";
import GlobalModal from "./GlobalModal";
import KakaolocationMap from "./KakaolocationMap";
import lightningService, {
  CompletedLightningResponse,
  LightningDetailGetResponse,
} from "../services/lightningService";

interface UserReservedLightningListProps {
  reservationLightning: MyLightningResponse[];
}

function UserReservedLightningList({
  reservationLightning,
}: UserReservedLightningListProps) {
  const navigate = useNavigate();
  const [lightningDetail, setLightningDetail] =
    useState<LightningDetailGetResponse | null>(null);
  const [completedLightning, setCompletedLightning] =
    useState<CompletedLightningResponse | null>(null);

  // 시간 포맷팅
  const formatTime = (date: string | number | Date) => {
    const dateObj = new Date(date);
    const hours = dateObj.getHours();
    const minutes = dateObj.getMinutes().toString().padStart(2, "0");

    return `${hours}:${minutes}`;
  };

  // 날짜 포맷팅 (MM월 DD일 형식)
  const formatDate = (date: string | number | Date) => {
    const dateObj = new Date(date);
    const month = dateObj.getMonth() + 1;
    const day = dateObj.getDate();

    return `${month}월 ${day}일`;
  };

  // 날짜별로 그룹화하는 함수
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

    // 날짜순으로 정렬된 배열로 변환
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

  // 날짜별로 그룹화된 데이터
  const groupedLightnings = groupByDate(reservationLightning);

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

  // 완료 처리 핸들러 추가
  const handleJoinLightningComplete = () => {
    const modal = document.getElementById(
      "join-complete-modal"
    ) as HTMLDialogElement;
    modal?.close();
    // 필요시 데이터 리프레시 로직 추가
  };

  // 번개 상세 정보 가져오기
  const fetchLightningDetail = async (lightningId: number) => {
    try {
      const detail = await lightningService.getLightningDetail(lightningId);
      setLightningDetail(detail);
      const completed = await lightningService.getCompletedLightnings(
        lightningId
      );
      setCompletedLightning(completed);

      // 모달 표시 로직 추가
      const modal = document.getElementById(
        "join-complete-modal"
      ) as HTMLDialogElement;
      modal?.showModal();
    } catch (error) {
      console.error("데이터 불러오기 실패:", error);
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex flex-col mt-4">
        {reservationLightning.length === 0 ? (
          <div className="text-center text-gray-500 my-20">
            예약된 번개 모임이 없습니다.
          </div>
        ) : (
          groupedLightnings.map((group, groupIndex) => (
            <div key={groupIndex} className="mb-6 ">
              <div className="text-2xl font-bold p-2 border-b-[3px] border-gray-300 w-[87%] mx-auto">
                {group.formattedDate}
              </div>
              <div className="flex flex-col items-center">
                {group.lightnings.map((lightning, index) => (
                  <div
                    key={lightning.lightning.lightningId}
                    className="w-[90%] relative"
                  >
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
                                {lightning.tags.tags.map((tag, index) => (
                                  <div
                                    key={index}
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

                      <div className="p-4 flex items-center justify-center md:mt-auto md:ml-0 mt-0 ml-auto">
                        <button
                          className="btn btn-outline btn-primary md:w-[150px] w-full no-animation"
                          onClick={() =>
                            fetchLightningDetail(
                              lightning.lightning.lightningId
                            )
                          }
                        >
                          예약내역 보기
                        </button>
                      </div>
                    </div>
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
      <GlobalModal
        id="join-complete-modal"
        title="참여 완료!"
        actions={
          <button className="btn" onClick={handleJoinLightningComplete}>
            닫기
          </button>
        }
      >
        <KakaolocationMap
          lat={lightningDetail?.latitude}
          lng={lightningDetail?.longitude}
        />
        <div>번개 제목 : {completedLightning?.routeTitle}</div>
        <div>번개 시작 시간 : {completedLightning?.eventDate}</div>
        <div>번개 진행 시간 : {completedLightning?.duration}</div>
        <div>정원 : {completedLightning?.capacity}</div>
        <div>참여자 : {completedLightning?.currentParticipants}</div>
        <div>참여 일시 : {completedLightning?.joinDate}</div>
        <p>번개에 참여하셨습니다!</p>
      </GlobalModal>
    </div>
  );
}

export default UserReservedLightningList;
