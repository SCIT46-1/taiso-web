import { useState, useEffect } from "react";

import routeService, {
  RouteListResponse,
  RouteListPageResponse,
} from "../services/routeService";
import bookmarkService, {
  BookmarkRoutesResponse,
} from "../services/bookmarkService";

interface RouteModalProps {
  onSelectRoute: (
    routeId: number,
    routeName: string,
    distance: number,
    imageUrl?: string
  ) => void;
  selectedRouteId?: number;
}

// Define a Route type for our internal use
interface Route {
  id: number;
  name: string;
  distance: number;
  region: string;
  bookmarked: boolean;
  imgId?: string;
}

function RouteModal({ onSelectRoute, selectedRouteId }: RouteModalProps) {
  const [activeTab, setActiveTab] = useState<"all" | "bookmarked">("all");
  const [allRoutes, setAllRoutes] = useState<Route[]>([]);
  const [bookmarkedRoutes, setBookmarkedRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination for all routes
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 3;

  // Fetch all routes with pagination
  useEffect(() => {
    const fetchAllRoutes = async () => {
      try {
        setLoading(true);
        setError(""); // Reset error state at the beginning of fetch

        const response: RouteListPageResponse = await routeService.getRouteList(
          page,
          pageSize,
          "", // Default sort by newest
          "", // region (empty for all)
          "", // distanceType
          "", // altitudeType
          "", // roadType
          [] // tags
        );

        // Map API response to our internal Route type
        const routes: Route[] = response.content.map(
          (route: RouteListResponse) => ({
            id: route.routeId,
            name: route.routeName,
            distance: route.distance,
            region: route.distanceType || "미지정", // Using distanceType as region
            bookmarked: route.bookmarked,
            imgId: route.routeImgId,
          })
        );

        setAllRoutes(routes);
        setTotalPages(response.totalPages);
      } catch (err) {
        console.error("Error fetching routes:", err);
        setError("루트를 불러오는데 실패했습니다.");
        setAllRoutes([]); // Reset routes on error
      } finally {
        setLoading(false);
      }
    };

    if (activeTab === "all") {
      fetchAllRoutes();
    }
  }, [page, activeTab]);

  // Fetch bookmarked routes
  useEffect(() => {
    const fetchBookmarkedRoutes = async () => {
      try {
        setLoading(true);
        setError(""); // Reset error state at the beginning of fetch

        const response: BookmarkRoutesResponse[] =
          await bookmarkService.getBookmarkRoutes();

        // Map API response to our internal Route type
        const routes: Route[] = response.map(
          (route: BookmarkRoutesResponse) => ({
            id: route.routeId,
            name: route.routeName,
            distance: route.distance,
            region: route.region || "미지정",
            bookmarked: true,
            imgId: route.routeImgId,
          })
        );

        setBookmarkedRoutes(routes);
      } catch (err) {
        console.error("Error fetching bookmarked routes:", err);
        setError("북마크된 루트를 불러오는데 실패했습니다.");
        setBookmarkedRoutes([]); // Reset bookmarked routes on error
      } finally {
        setLoading(false);
      }
    };

    if (activeTab === "bookmarked") {
      fetchBookmarkedRoutes();
    }
  }, [activeTab]);

  const filteredRoutes = (
    activeTab === "all" ? allRoutes : bookmarkedRoutes
  ).filter((route) =>
    route.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Function to get selected route
  const getSelectedRoute = () => {
    if (selectedRouteId) {
      const route = [...allRoutes, ...bookmarkedRoutes].find(
        (r) => r.id === selectedRouteId
      );
      return route || null;
    }
    return null;
  };

  const selectedRoute = getSelectedRoute();

  // Function to get route image URL

  return (
    <div className="route-modal w-full px-6 pt-6 h-full">
      <h2 className="text-2xl font-bold mb-4">경로 선택</h2>

      {/* Search bar */}
      <div className="form-control my-4 w-2/3 my-2">
        <div className="input-group flex items-center gap-2">
          <input
            type="text"
            placeholder="경로 검색..."
            className="input input-bordered w-full h-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="btn btn-square h-7 w-11">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs tabs-boxed mb-2 w-2/5">
        <a
          className={`tab ${activeTab === "all" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("all")}
        >
          전체 루트
        </a>
        <a
          className={`tab ${activeTab === "bookmarked" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("bookmarked")}
        >
          북마크 루트
        </a>
      </div>

      {loading ? (
        <div className="flex justify-center items-center p-8 h-full">
          <span className="loading loading-spinner loading-md "></span>
        </div>
      ) : error ? (
        <div className="alert alert-error">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{error}</span>
        </div>
      ) : filteredRoutes.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {activeTab === "all"
            ? "등록된 루트가 없습니다."
            : "북마크한 루트가 없습니다."}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3 max-h-[300px] overflow-y-auto">
          {filteredRoutes.map((route) => (
            <div
              key={route.id}
              className={`card card-compact cursor-pointer w-30 bg-base-100 border hover:border-primary ${
                selectedRouteId === route.id
                  ? "border-primary"
                  : "border-gray-200"
              }`}
              onClick={() =>
                onSelectRoute(route.id, route.name, route.distance, route.imgId)
              }
            >
              <div className="card-body">
                {/* Route Image */}
                <div className="h-32 overflow-hidden">
                  <img
                    src={route.imgId}
                    alt={route.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback for failed image loads
                      (e.target as HTMLImageElement).src = "";
                    }}
                  />
                </div>

                <div className="flex flex-col justify-between p-1">
                  <div className="flex gap-1 items-center">
                    <h3 className="card-title text-base">{route.name}</h3>
                    {route.bookmarked && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-yellow-500 fill-current"
                        viewBox="0 0 20 20"
                      >
                        <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex justify-between text-sm">
                    <div className="badge badge-outline badge-primary mb-1">
                      {route.region}
                    </div>
                    <span className="font-semibold">{route.distance} km</span>
                  </div>
                </div>

                {selectedRouteId === route.id && (
                  <div className="absolute top-2 right-2">
                    <div className="badge badge-primary badge-sm p-2.5">
                      선택
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add a selection confirmation at the bottom if route is selected */}
      {selectedRoute && (
        <div role="alert" className="alert alert-outline my-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>
            선택된 경로: {selectedRoute.name} ({selectedRoute.distance} km)
          </span>
        </div>
      )}

      {/* Pagination for All Routes tab */}
      {activeTab === "all" && totalPages > 1 && !loading && (
        <div className="flex justify-center mt-4">
          <div className="join">
            <button
              className="join-item btn btn-sm"
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
            >
              «
            </button>
            <button className="join-item btn btn-sm">
              {page + 1} / {totalPages}
            </button>
            <button
              className="join-item btn btn-sm"
              disabled={page >= totalPages - 1}
              onClick={() => setPage(page + 1)}
            >
              »
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default RouteModal;
