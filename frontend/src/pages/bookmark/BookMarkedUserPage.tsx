import BookmarkNavBar from "../../components/BookmarkNavBar";
import BookmarkUserList from "../../components/BookmarkUserList";

function BookMarkedUserPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-xl font-bold mb-2 text-center">북마크</h1>
      <BookmarkNavBar />
      <BookmarkUserList />
    </div>
  );
}

export default BookMarkedUserPage;
