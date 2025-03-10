import { useEffect, useState } from "react";
import UserLightningVar from "../../components/UserLightningVar";
import userDetailService, {
  MyLightningResponse,
} from "../../services/userDetailService";
import UserReservedLightningList from "../../components/UserReservedLightningList";

function UserLightningPage() {
  const [reservationLightning, setReservationLightning] = useState<
    MyLightningResponse[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await userDetailService.getMyReservationLightning();
        setReservationLightning(data);
        setError(null);
      } catch (error) {
        console.error(error);
        setError("예약된 라이트닝 정보를 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="flex flex-col w-full max-w-screen-lg mx-auto">
      <UserLightningVar />

      <div className="p-4">
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
          <UserReservedLightningList
            reservationLightning={reservationLightning}
          />
        )}
      </div>
    </div>
  );
}

export default UserLightningPage;
