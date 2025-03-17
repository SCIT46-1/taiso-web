import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import MainNavbar from "../components/MainNavbar";
import RouteList from "../components/RouteList";

const availableTags: string[] = [
  "한강 자전거길",
  "국토종주길",
  "산악 도로",
  "평지 도로",
  "위험한 공도",
];

const locationTags: string[] = [
  "서울",
  "경기",
  "인천",
  "강원",
  "충청",
  "전라",
  "경상",
  "제주",
];

const distanceTags: string[] = ["단거리", "중거리", "장거리"];

const altitudeTags: string[] = ["마운틴", "힐리", "평지"];

const roadTypeTags: string[] = ["산길", "공도", "자전거도로"];
function RoutePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const sort: string = searchParams.get("sort") || "createdAt";

  // 일반 태그 (다중 선택)
  const [selectedAvailableTags, setSelectedAvailableTags] = useState<string[]>(
    []
  );
  // 단일 선택 태그: 지역, 거리, 고도, 도로 유형
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedDistance, setSelectedDistance] = useState<string | null>(null);
  const [selectedAltitude, setSelectedAltitude] = useState<string | null>(null);
  const [selectedRoadType, setSelectedRoadType] = useState<string | null>(null);

  // 일반 태그 토글 함수
  const toggleAvailableTag = (tag: string): void => {
    if (selectedAvailableTags.includes(tag)) {
      setSelectedAvailableTags(selectedAvailableTags.filter((t) => t !== tag));
    } else {
      setSelectedAvailableTags([...selectedAvailableTags, tag]);
    }
  };

  // 단일 선택 토글 함수들
  const toggleLocationTag = (tag: string): void => {
    setSelectedLocation(selectedLocation === tag ? null : tag);
  };

  const toggleDistanceTag = (tag: string): void => {
    setSelectedDistance(selectedDistance === tag ? null : tag);
  };

  const toggleAltitudeTag = (tag: string): void => {
    setSelectedAltitude(selectedAltitude === tag ? null : tag);
  };

  const toggleRoadTypeTag = (tag: string): void => {
    setSelectedRoadType(selectedRoadType === tag ? null : tag);
  };

  // 검색 버튼 클릭 시: 각 태그별 쿼리 파라미터를 업데이트
  const handleSearch = (): void => {
    // 일반 태그는 "tags" 파라미터로 설정 (다중 선택)
    if (selectedAvailableTags.length > 0) {
      searchParams.set("tags", selectedAvailableTags.join(","));
    } else {
      searchParams.delete("tags");
    }

    // 단일 선택 태그들은 각각 별도의 쿼리 파라미터로 설정
    if (selectedLocation) {
      searchParams.set("region", selectedLocation);
    } else {
      searchParams.delete("region");
    }

    if (selectedDistance) {
      searchParams.set("distanceType", selectedDistance);
    } else {
      searchParams.delete("distanceType");
    }

    if (selectedAltitude) {
      searchParams.set("altitudeType", selectedAltitude);
    } else {
      searchParams.delete("altitudeType");
    }

    if (selectedRoadType) {
      searchParams.set("roadType", selectedRoadType);
    } else {
      searchParams.delete("roadType");
    }

    setSearchParams(searchParams);

    const modal = document.getElementById(
      "my_modal_2"
    ) as HTMLDialogElement | null;
    if (modal) modal.close();
  };

  // 기존 쿼리 파라미터를 유지하면서 sort 파라미터만 변경하는 헬퍼 함수
  const getSortLink = (newSort: string): string => {
    const params = new URLSearchParams(searchParams.toString()); // 클론 생성
    params.set("sort", newSort);
    return `/route?${params.toString()}`;
  };

  return (
    <div className="flex flex-col w-full">
      <MainNavbar />
      <div className="flex-1 mx-auto w-full">
        <div className="flex items-center mb-2 gap-2">
          {/* 데이지UI 탭 컴포넌트를 이용한 정렬 UI */}
          <div role="tablist" className="tabs tabs-boxed w-fit sm:ml-8 ml-4 bg-transparent border-t border-b border-l border-r">
            <Link
              role="tab"
              to={getSortLink("createdAt")}
              className={`tab ${sort === "createdAt" ? "tab-active" : ""}`}
            >
              최신 순
            </Link>
            <Link
              role="tab"
              to={getSortLink("likeCount")}
              className={`tab ${sort === "likeCount" ? "tab-active" : ""}`}
            >
              좋아요 순
            </Link>
          </div>
          <div
            className="btn md:btn-sm btn-xs my-1 btn-outline text-gray-400 rounded-full border-1 hover:bg-primary hover:border-primary"
            onClick={() => {
              const modal = document.getElementById(
                "my_modal_2"
              ) as HTMLDialogElement | null;
              if (modal) {
                modal.showModal();
              }
            }}
          >
            태그
          </div>
        </div>
        <div className="fixed bottom-8 right-10 z-50">
          <Link
            to="/route/post"
            className="btn btn-primary btn-circle no-animation"
          >
            <svg
              data-slot="icon"
              fill="currentColor"
              className="size-8"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z"></path>
            </svg>
          </Link>
        </div>
        <div className="flex items-center gap justify-start my-4">
          {/* 선택된 필터 태그 표시 영역 */}
          {(selectedAvailableTags.length > 0) && (
            <div className="flex flex-wrap md:gap-2 gap-1 md:ml-12 md:justify-start justify-center">
              {selectedAvailableTags.map((tag) => (
                <span
                  key={tag}
                  className="badge badge-primary gap-1 md:text-sm text-xs h-6"
                >
                  {tag}
                  <button onClick={() => toggleAvailableTag(tag)}>×</button>
                </span>
              ))}
            </div>
          )}
          {/* 태그 일괄 삭제 버튼 */}
          <div className="flex items-center justify-center px-2">
            {(selectedAvailableTags.length > 0 ||
              selectedLocation ||
              selectedDistance ||
              selectedAltitude ||
              selectedRoadType) && (
                <button
                  className="btn btn-outline border-red-500 btn-xs btn-circle hover:bg-red-200 hover:border-red-500"
                  onClick={() => {
                    setSelectedAvailableTags([]);
                    setSelectedLocation(null);
                    setSelectedDistance(null);
                    setSelectedAltitude(null);
                    setSelectedRoadType(null);
                  }}>
                  <svg data-Slot="icon" fill="none" strokeWidth={1.5} stroke="red" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="h-4 w-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
          </div>
        </div>



        {/* 모달 컴포넌트 */}
        <dialog id="my_modal_2" className="modal">
          <form method="dialog" className="modal-box">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg">태그 검색</h3>

              <button
                type="button"
                className="btnbtn btn-outline border-red-500 btn-xs btn-circle hover:bg-red-200 hover:border-red-500"
                onClick={() => {
                  const modal = document.getElementById(
                    "my_modal_2"
                  ) as HTMLDialogElement | null;
                  if (modal) modal.close();
                }}
              >
                닫기
                </button>
            </div>

            <p className="mt-4 mb-1 text-sm text-gray-500 flex items-center gap-1 md:justify-start justify-center">원하는 태그를 선택하세요:</p>
            {/* 일반 태그 (다중 선택) */}
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <button
                  type="button"
                  key={tag}
                  onClick={() => toggleAvailableTag(tag)}
                  className={`btn md:btn-sm btn-xs my-1 btn-outline text-gray-400 rounded-full border-1 hover:bg-primary hover:border-primary ${
                    selectedAvailableTags.includes(tag)
                      ? "badge-primary"
                      : "badge-outline"
                  }`}
                >
                  {tag}
                  {selectedAvailableTags.includes(tag) && " ✓"}
                </button>
              ))}
            </div>
            {/* 지역 (단일 선택) */}
            <div className="my-1 text-sm text-gray-500 flex items-center gap-1 md:justify-start justify-center">
              지역</div>
            <div className="flex flex-wrap gap-2">
              {locationTags.map((tag) => (
                <button
                  type="button"
                  key={tag}
                  onClick={() => toggleLocationTag(tag)}
                  className={`btn md:btn-sm btn-xs my-1 btn-outline text-gray-400 rounded-full border-1 hover:bg-primary hover:border-primary ${
                    selectedLocation === tag ? "badge-primary" : "badge-outline"
                  }`}
                >
                  {tag}
                  {selectedLocation === tag && " ✓"}
                </button>
              ))}
            </div>
            {/* 거리 (단일 선택) */}
            <div className="my-1 text-sm text-gray-500 flex items-center gap-1 md:justify-start justify-center">
              거리</div>
            <div className="flex flex-wrap gap-2">
              {distanceTags.map((tag) => (
                <button
                  type="button"
                  key={tag}
                  onClick={() => toggleDistanceTag(tag)}
                  className={`btn md:btn-sm btn-xs my-1 btn-outline text-gray-400 rounded-full border-1 hover:bg-primary hover:border-primary ${
                    selectedDistance === tag ? "badge-primary" : "badge-outline"
                  }`}
                >
                  {tag}
                  {selectedAltitude === tag && " ✓"}
                </button>
              ))}
            </div>
            {/* 고도 (단일 선택) */}
            <div className="my-1 text-sm text-gray-500 flex items-center gap-1 md:justify-start justify-center">
              고도</div>
            <div className="flex flex-wrap gap-2">
              {altitudeTags.map((tag) => (
                <button
                  type="button"
                  key={tag}
                  onClick={() => toggleAltitudeTag(tag)}
                  className={`btn md:btn-sm btn-xs my-1 btn-outline text-gray-400 rounded-full border-1 hover:bg-primary hover:border-primary ${
                    selectedAltitude === tag ? "badge-primary" : "badge-outline"
                  }`}
                >
                  {tag}
                  {selectedAltitude === tag && " ✓"}
                </button>
              ))}
            </div>
            {/* 도로 유형 (단일 선택) */}
            <div className="my-1 text-sm text-gray-500 flex items-center gap-1 md:justify-start justify-center">
              도로 유형</div>
            <div className="flex flex-wrap gap-2">
              {roadTypeTags.map((tag) => (
                <button
                  type="button"
                  key={tag}
                  onClick={() => toggleRoadTypeTag(tag)}
                  className={`btn md:btn-sm btn-xs my-1 btn-outline text-gray-400 rounded-full border-1 hover:bg-primary hover:border-primary ${
                    selectedRoadType === tag ? "badge-primary" : "badge-outline"
                  }`}
                >
                  {tag}
                  {selectedRoadType === tag && " ✓"}
                </button>
              ))}
            </div>
            <div className="modal-action mt-4">
              <button type="button" className="btn btn-primary w-full" onClick={handleSearch}>
                검색
              </button>
            </div>
          </form>
        </dialog>
        {/* 선택된 태그는 URL 쿼리로 전달되어 RouteList에서 활용 */}
        <RouteList
          sort={sort}
          region={searchParams.get("region") || ""}
          distanceType={searchParams.get("distanceType") || ""}
          altitudeType={searchParams.get("altitudeType") || ""}
          roadType={searchParams.get("roadType") || ""}
          tags={searchParams.get("tags")?.split(",") || []}
        />
      </div>
    </div>
  );
}

export default RoutePage;
