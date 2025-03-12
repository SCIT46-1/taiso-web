import BookmarkNavBar from "../../components/BookmarkNavBar";
import BookmarkUserList from "../../components/BookmarkUserList";

function BookMarkedUserPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">북마크</h1>
      <BookmarkNavBar />
      <h2 className="text-xl font-bold mt-6 mb-4">북마크한 유저 목록</h2>
      <BookmarkUserList />
    </div>
  );
}

export default BookMarkedUserPage;
