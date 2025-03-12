import { Link } from "react-router";
import bookmarkService, {
  BookmarkUsersResponse,
} from "../services/bookmarkService";
import { useEffect, useState } from "react";

function BookmarkUserList() {
  const [bookmarkUsers, setBookmarkUsers] = useState<BookmarkUsersResponse[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBookmarkUsers = async () => {
      try {
        const data = await bookmarkService.getBookmarkUsers();
        setBookmarkUsers(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBookmarkUsers();
  }, []);

  // 북마크 삭제 핸들러
  const handleRemoveBookmark = async (e: React.MouseEvent, userId: number) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await bookmarkService.deleteBookmarkUser(userId);
      setBookmarkUsers((prevState) =>
        prevState.filter((user) => user.bookmarkedUserId !== userId)
      );
    } catch (error) {
      console.error("Failed to remove bookmark:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="loading loading-dots loading-lg"></div>
      </div>
    );
  }

  if (bookmarkUsers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 p-4">
        <div className="text-lg font-medium mb-2">북마크한 유저가 없습니다</div>
        <p className="text-gray-500 text-center">
          관심있는 유저를 북마크해보세요!
        </p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">북마크한 유저 목록</h2>
      <div className="grid grid-cols-1 gap-4">
        {bookmarkUsers.map((user) => (
          <Link to={`/users/${user.bookmarkedUserId}`} key={user.bookmarkId}>
            <div
              key={user.bookmarkId}
              className="card card-side bg-base-100 shadow-md hover:shadow-lg transition-shadow duration-300 relative"
            >
              {/* 북마크 제거 아이콘 */}
              <svg
                data-slot="icon"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                className="size-7 text-gray-600 absolute top-2 right-2 z-10 cursor-pointer"
                onClick={(e) => handleRemoveBookmark(e, user.bookmarkedUserId)}
              >
                <path
                  clipRule="evenodd"
                  fillRule="evenodd"
                  d="M10 2c-1.716 0-3.408.106-5.07.31C3.806 2.45 3 3.414 3 4.517V17.25a.75.75 0 0 0 1.075.676L10 15.082l5.925 2.844A.75.75 0 0 0 17 17.25V4.517c0-1.103-.806-2.068-1.93-2.207A41.403 41.403 0 0 0 10 2Z"
                ></path>
              </svg>

              <figure className="w-24 h-24 p-2">
                {user.userProfileImg ? (
                  <img
                    src={user.userProfileImg}
                    alt={`${user.userNickname}의 프로필`}
                    className="rounded-full object-cover w-full h-full"
                  />
                ) : (
                  <div className="avatar placeholder">
                    <div className="bg-neutral-focus text-neutral-content rounded-full w-full h-full">
                      <span className="text-xl">
                        {user.userNickname.charAt(0)}
                      </span>
                    </div>
                  </div>
                )}
              </figure>
              <div className="card-body py-4">
                <div className="flex items-center justify-between">
                  <h3 className="card-title text-lg">{user.userNickname}</h3>
                  <div className="badge badge-primary">{user.level}</div>
                </div>
                <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                  <span className="badge badge-outline">{user.gender}</span>
                  <span>북마크 {user.totalBookmark}개</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {formatDate(user.createdAt)}에 북마크됨
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// 날짜 형식화 함수
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}년 ${month}월 ${day}일`;
  } catch (error) {
    return dateString;
  }
}

export default BookmarkUserList;
