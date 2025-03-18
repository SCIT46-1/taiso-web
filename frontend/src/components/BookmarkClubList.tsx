import bookmarkService, { Club } from "../services/bookmarkService";
import { useEffect, useState } from "react";
import ClubCard from "./ClubCard";

function BookmarkClubList() {
  const [bookmarkClubs, setBookmarkClubs] = useState<Club[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBookmarkClubs = async () => {
      try {
        const res = await bookmarkService.getBookmarkClubs();
        setBookmarkClubs(res.content);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBookmarkClubs();
  }, []);

  // 북마크 취소 시 목록에서 해당 클럽 제거
  const handleBookmarkRemove = (clubId: number) => {
    setBookmarkClubs((prevClubs) =>
      prevClubs.filter((club) => club.clubId !== clubId)
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="loading loading-dots loading-lg"></div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto">
      {bookmarkClubs.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 p-4">
          <div className="text-lg font-medium mb-2">
            북마크한 클럽이 없습니다
          </div>
          <p className="text-gray-500 text-center">
            관심있는 클럽을 북마크해보세요!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 justify-center gap-2 mt-4 px-12">
          {bookmarkClubs.map((club) => (
            <ClubCard
              key={club.clubId}
              club={club}
              isBookmarkPage={true}
              onBookmarkRemove={handleBookmarkRemove}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default BookmarkClubList;
