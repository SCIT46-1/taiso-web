import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MyLightningResponse } from "../services/userDetailService";
import ImageWithSkeleton from "./ImageWithSkeleton";

interface UserReservedLightningListProps {
  reservationLightning: MyLightningResponse[];
}

function UserReservedLightningList({
  reservationLightning,
}: UserReservedLightningListProps) {
  const formatDate = (date: string | number | Date) => {
    const options: Intl.DateTimeFormatOptions = {
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: false,
    };

    return new Date(date)
      .toLocaleString("ko-KR", options)
      .replace("오전", "")
      .replace("오후", "");
  };

  // Group events by date
  const groupedByDate = reservationLightning.reduce((acc, lightning) => {
    const eventDate = new Date(lightning.lightning.eventDate);
    const dateKey = eventDate.toLocaleDateString("ko-KR", {
      month: "long",
      day: "numeric",
    });

    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(lightning);
    return acc;
  }, {} as Record<string, MyLightningResponse[]>);

  return (
    <div className="flex flex-col items-center justify-center mx-auto ">
      <div className="flex flex-wrap gap-2 mt-4">
        {Object.keys(groupedByDate).length === 0 ? (
          <div className="text-center text-gray-500 my-20">
            예약된 번개 모임이 없습니다.
          </div>
        ) : (
          Object.entries(groupedByDate).map(([date, lightnings]) => (
            <div key={date} className="w-full flex flex-col items-center">
              <h2 className="text-xl font-bold mt-4">{date}</h2>
              {lightnings.map((lightning) => (
                <div key={lightning.lightning.lightningId} className="w-[90%]">
                  <Link to={`/lightning/${lightning.lightning.lightningId}`}>
                    <div className="bg-base-100 w-full flex items-center">
                      <figure className="size-40 flex items-center justify-center ml-4 relative">
                        <div className="bg-primary rounded-full size-24 flex items-center justify-center text-white text-lg font-semibold">
                          {lightning.lightning.status}
                        </div>
                      </figure>
                      <div className="flex flex-col p-2 ml-4">
                        <div className="flex flex-col ">
                          <div className="text-xs text-gray-500">
                            {formatDate(lightning.lightning.eventDate)} (
                            {lightning.lightning.duration}분)
                          </div>
                          <div className="text-lg font-semibold">
                            {lightning.lightning.title}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            {lightning.lightning.address}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            {lightning.users.length}/
                            {lightning.lightning.capacity}명
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2 max-w-[400px]">
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
                  <div className="divider w-full -my-2"></div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default UserReservedLightningList;
