import { useState, useEffect } from "react";
import userDetailService, {
  MyLightningResponse,
} from "../services/userDetailService";
import CompletedLightningItem from "./CompletedLightningItem";

function UserCompletedLightningList() {
  const [completedLightnings, setCompletedLightnings] = useState<
    MyLightningResponse[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showLoader, setShowLoader] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompletedLightnings = async () => {
      let loaderTimer: NodeJS.Timeout | null = null;

      try {
        setLoading(true);

        // Set a timer to show loader after 300ms if the request is still ongoing
        loaderTimer = setTimeout(() => {
          setShowLoader(true);
        }, 300);

        const data = await userDetailService.getMyCompletedLightning();
        setCompletedLightnings(data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch completed lightnings:", err);
        setError("라이트닝 정보를 불러오는데 실패했습니다.");
      } finally {
        // Clear the timer if it exists
        if (loaderTimer) {
          clearTimeout(loaderTimer);
        }
        setLoading(false);
        setShowLoader(false);
      }
    };

    fetchCompletedLightnings();
  }, []);

  // Group events by date
  const groupedByDate = completedLightnings.reduce((acc, lightning) => {
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
    <div className="flex flex-col w-full">
      {error && (
        <div className="alert alert-error shadow-lg w-full mb-4">
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

      {loading && showLoader ? (
        <div className="flex w-full justify-center my-20">
          <div className="loading loading-dots loading-lg"></div>
        </div>
      ) : completedLightnings.length === 0 ? (
        <div className="text-center text-gray-500 my-20 p-8 w-full border border-dashed rounded-lg">
          완료된 라이트닝이 없습니다.
        </div>
      ) : (
        Object.entries(groupedByDate).map(([date, lightnings]) => (
          <div key={date} className="w-full mb-6">
            <h2 className="text-xl font-bold mb-4 px-4">{date}</h2>
            <div className="flex flex-col gap-4">
              {lightnings.map((lightning) => (
                <CompletedLightningItem
                  key={lightning.lightning.lightningId}
                  lightning={lightning}
                  disableOuterLink={true}
                />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default UserCompletedLightningList;
