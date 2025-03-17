import { useEffect, useState } from "react";
import clubService, {
  ClubListResponse,
  IClubList,
} from "../services/clubService";
import ClubCard from "./ClubCard";

function ClubList() {
  const [isLoading, setIsLoading] = useState(true);
  const [clubList, setClubList] = useState<IClubList[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLastPage, setIsLastPage] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    const fetchInitialClubList = async () => {
      try {
        const data = await clubService.getClubList(0);
        setClubList(data.content);
        setIsLastPage(data.last);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialClubList();
  }, []);

  const handleLoadMore = async () => {
    if (isLastPage) return;

    setLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const data = await clubService.getClubList(nextPage);

      setClubList((prevList) => [...prevList, ...data.content]);
      setCurrentPage(nextPage);
      setIsLastPage(data.last);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingMore(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full mx-auto mt-7">
        <div className="grid grid-cols-2 justify-center gap-2 mt-4">
          {clubList?.content.map((club) => (
            <ClubCard key={club.clubId} club={club} />
          ))}
        </div>
      {!isLastPage && (
        <div className="w-full flex justify-center my-6">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="px-4 py-2 bg-primary text-white rounded-md disabled:bg-gray-300"
          >
            {loadingMore ? "로딩 중..." : "더보기"}
          </button>
        </div>
      )}
    </div>
  );
}

export default ClubList;
