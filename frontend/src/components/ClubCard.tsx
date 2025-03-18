import { Link, useNavigate } from "react-router";
import { IClubList } from "../services/clubService";
import bookmarkService from "../services/bookmarkService";
import { useState, useEffect } from "react";

function ClubCard({
  club,
  isBookmarkPage,
  onBookmarkRemove,
}: {
  club: IClubList;
  isBookmarkPage?: boolean;
  onBookmarkRemove?: (clubId: number) => void;
}) {
  const [isBookmarked, setIsBookmarked] = useState(
    isBookmarkPage ? true : club.bookmarked || false
  );
  const navigate = useNavigate();

  useEffect(() => {
    if (isBookmarkPage) {
      setIsBookmarked(true);
    }
  }, [isBookmarkPage]);

  const handleBookmarkToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      if (!isBookmarked) {
        await bookmarkService.bookmarkClub(club.clubId);
      } else {
        await bookmarkService.deleteBookmarkClub(club.clubId);

        if (isBookmarkPage && onBookmarkRemove) {
          onBookmarkRemove(club.clubId);
          return;
        }
      }

      setIsBookmarked(!isBookmarked);
    } catch (error) {
      console.error("Bookmark operation failed:", error);

      if (
        error instanceof Error &&
        "response" in (error as any) &&
        (error as any).response?.status === 401
      ) {
        navigate("/auth/landing");
      }
    }
  };

  return (
    <>
      <div className="mx-auto w-full max-w-4xl rounded-lg hover:bg-base-200">
        <div className="flex mb-1">
          <Link to={`/club/${club.clubId}`} className="flex-1">
            <div className="w-full flex items-center p-4 relative">
              {!isBookmarked ? (
                <svg
                  data-slot="icon"
                  fill="none"
                  strokeWidth="1.75"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                  className="size-7 text-blue-500 absolute top-3 right-3 z-10 cursor-pointer"
                  onClick={handleBookmarkToggle}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"
                  ></path>
                </svg>
              ) : (
                <svg
                  data-slot="icon"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                  className="size-7 text-blue-500 absolute top-3 right-3 z-10 cursor-pointer"
                  onClick={handleBookmarkToggle}
                >
                  <path
                    clipRule="evenodd"
                    fillRule="evenodd"
                    d="M10 2c-1.716 0-3.408.106-5.07.31C3.806 2.45 3 3.414 3 4.517V17.25a.75.75 0 0 0 1.075.676L10 15.082l5.925 2.844A.75.75 0 0 0 17 17.25V4.517c0-1.103-.806-2.068-1.93-2.207A41.403 41.403 0 0 0 10 2Z"
                  ></path>
                </svg>
              )}

              {club.clubProfileImageId === null ? (
                <div className="h-24 w-24 rounded-2xl bg-gray-200"></div>
              ) : (
                <img
                  src={`https://taiso-web-gpx-file-space.s3.ap-southeast-2.amazonaws.com/${club.clubProfileImageId}`}
                  alt={club.clubName}
                  className="h-24 w-24 rounded-2xl"
                />
              )}
              <div className="flex flex-col p-2 ml-2">
                <div className="flex flex-col">
                  <div className="text-lg font-semibold">{club.clubName}</div>
                  <div className="text-sm text-gray-500 mt-1 max-w-[300px] truncate">
                    {club.clubShortDescription}
                  </div>
                  <div className="text-sm text-gray-500 flex items-center gap-1 mt-2">
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
                    {club.currentScale}/{club.maxScale}명
                  </div>
                  <div className="flex flex-wrap gap-1 max-w-[400px] mt-2">
                    {club.tags.map((tag, index) => (
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
        </div>
        <div className="divider w-full -my-2 -mb-1"></div>
      </div>
    </>
  );
}

export default ClubCard;
