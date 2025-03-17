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
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-xl font-semibold mb-2 text-center">내 클럽</h1>
      <div className="w-full mx-auto">
        <div className="grid grid-cols-2 justify-center gap-2 mt-4 px-12">
        {clubData?.content.map((club) => (
          <ClubCard club={club} />
        ))}
        </div>
      </div>
    </div>
  );
}

export default UserClubPage;
