import BookmarkClubList from "../../components/BookmarkClubList";
import BookmarkNavBar from "../../components/BookmarkNavBar";

function BookMarkedClubPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-xl font-semibold mb-2 text-center">북마크</h1>
      <BookmarkNavBar />
      <BookmarkClubList />
    </div>
  );
}

export default BookMarkedClubPage;
