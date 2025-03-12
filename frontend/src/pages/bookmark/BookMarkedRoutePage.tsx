import BookmarkedRouteList from "../../components/BookmarkedRouteList";
import BookmarkNavBar from "../../components/BookmarkNavBar";

function BookMarkedRoutePage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">북마크</h1>
      <BookmarkNavBar />
      <h2 className="text-xl font-bold mt-6 mb-4">북마크한 루트 목록</h2>
      <BookmarkedRouteList />
    </div>
  );
}

export default BookMarkedRoutePage;
