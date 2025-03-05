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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await userDetailService.getMyReservationLightning();
        console.log(data);
        setReservationLightning(data);
        setIsLoading(false);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center max-w-screen-md w-full  ">
      <UserLightningVar />
      {!isLoading && (
        <UserReservedLightningList
          reservationLightning={reservationLightning}
        />
      )}
    </div>
  );
}

export default UserLightningPage;
