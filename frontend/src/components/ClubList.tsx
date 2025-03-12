import { useEffect, useState } from "react";
import clubService, { ClubListResponse } from "../services/clubService";
import ClubCard from "./ClubCard";

function ClubList() {
  const [isLoading, setIsLoading] = useState(true);
  const [clubList, setClubList] = useState<ClubListResponse>();

  useEffect(() => {
    const fetchClubList = async () => {
      try {
        const data = await clubService.getClubList();
        setClubList(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchClubList();
  }, []);
  console.log(clubList);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full mx-auto">
      {clubList?.content.map((club) => (
        <ClubCard key={club.clubId} club={club} />
      ))}
    </div>
  );
}

export default ClubList;
