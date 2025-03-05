import { Link } from "react-router-dom";
import { MyLightningResponse } from "../services/userDetailService";

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
    <div className="flex flex-col items-center justify-center w-full">
      {Object.keys(groupedByDate).length === 0 ? (
        <div className="text-center text-gray-500 my-20 p-8 w-full border border-dashed rounded-lg">
          예약된 번개 모임이 없습니다.
        </div>
      ) : (
        Object.entries(groupedByDate).map(([date, lightnings]) => (
          <div key={date} className="w-full mb-6">
            <h2 className="text-xl font-bold mb-4 px-4">{date}</h2>
            <div className="flex flex-col gap-4">
              {lightnings.map((lightning) => (
                <div
                  key={lightning.lightning.lightningId}
                  className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow w-full"
                >
                  <Link to={`/lightning/${lightning.lightning.lightningId}`}>
                    <div className="bg-base-100 w-full flex items-center p-4">
                      <figure className="size-40 flex items-center justify-center relative mr-4">
                        <div className="bg-primary rounded-full size-24 flex items-center justify-center text-white text-lg font-semibold">
                          {lightning.lightning.status}
                        </div>
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
                            {lightning.users.length}/
                            {lightning.lightning.capacity}명
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {lightning.tags.tags
                              .slice(0, 3)
                              .map((tag, index) => (
                                <div
                                  key={index}
                                  className="badge badge-primary badge-outline text-xs"
                                >
                                  {tag}
                                </div>
                              ))}
                            {lightning.tags.tags.length > 3 && (
                              <div className="badge badge-primary badge-outline text-xs">
                                +{lightning.tags.tags.length - 3}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default UserReservedLightningList;
