import BookmarkedRouteList from "../../components/BookmarkedRouteList";
import BookmarkNavBar from "../../components/BookmarkNavBar";

function BookMarkedRoutePage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-xl font-bold mb-2 text-center">북마크</h1>
      <BookmarkNavBar />
      <BookmarkedRouteList />
    </div>
  );
}

export default BookMarkedRoutePage;
