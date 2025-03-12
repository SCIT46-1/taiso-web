import { useEffect, useState } from "react";
import clubService, { ClubListResponse } from "../../services/clubService";
import ClubCard from "../../components/ClubCard";

function UserClubPage() {
  const [clubData, setClubData] = useState<ClubListResponse>();

  useEffect(() => {
    const fetchClubData = async () => {
      const data = await clubService.getMyClub();
      setClubData(data);
    };
    fetchClubData();
  }, []);

  console.log(clubData);

  return (
    <div>
      <div className="text-2xl font-bold">내가 가입한 클럽</div>
      <div className="flex flex-wrap gap-4">
        {clubData?.content.map((club) => (
          <ClubCard club={club} />
        ))}
      </div>
    </div>
  );
}

export default UserClubPage;
