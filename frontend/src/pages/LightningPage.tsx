import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import MainNavbar from "../components/MainNavbar";
import LightningList from "../components/LightningList";
import DateCarousel from "../components/DateCarousel";

// 성별 필터 옵션
const genderTags: string[] = ["남", "여", "자유"];

// 자전거 타입 필터 옵션
const bikeTypeTags: string[] = ["로드", "MTB", "하이브리드", "기타"];

// 난이도 필터 옵션
const levelTags: string[] = ["입문", "초급", "중급", "고급"];

// 지역 필터 옵션
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

// 일반 태그 옵션
const availableTags: string[] = [
  "샤방법",
  "오픈라이딩",
  "따폭연",
  "장거리",
  "따릉이",
  "친목",
];

function LightningPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSort = searchParams.get("sort") || "eventDate";
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // 일반 태그 (다중 선택)
  const [selectedAvailableTags, setSelectedAvailableTags] = useState<string[]>(
    searchParams.get("tags")?.split(",") || []
  );

  // 단일 선택 태그들
  const [selectedGender, setSelectedGender] = useState<string | null>(
    searchParams.get("gender")
  );
  const [selectedBikeType, setSelectedBikeType] = useState<string | null>(
    searchParams.get("bikeType")
  );
  const [selectedLevel, setSelectedLevel] = useState<string | null>(
    searchParams.get("level")
  );
  const [selectedLocation, setSelectedLocation] = useState<string | null>(
    searchParams.get("region")
  );

  // 태그 모달 열림 상태
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);

  // Keep track of dropdown elements

  // 일반 태그 토글 (상태만 업데이트)
  const toggleAvailableTag = (tag: string): void => {
    if (selectedAvailableTags.includes(tag)) {
      setSelectedAvailableTags(selectedAvailableTags.filter((t) => t !== tag));
    } else {
      setSelectedAvailableTags([...selectedAvailableTags, tag]);
    }
  };

  // Update toggle functions to close dropdown after selection
  const toggleGenderTag = (tag: string): void => {
    setSelectedGender(selectedGender === tag ? null : tag);
    // Close the dropdown by adding an artificial click event on the document
    document.body.click();
  };

  const toggleBikeTypeTag = (tag: string): void => {
    setSelectedBikeType(selectedBikeType === tag ? null : tag);
    document.body.click();
  };

  const toggleLevelTag = (tag: string): void => {
    setSelectedLevel(selectedLevel === tag ? null : tag);
    document.body.click();
  };

  const toggleLocationTag = (tag: string): void => {
    setSelectedLocation(selectedLocation === tag ? null : tag);
    document.body.click();
  };

  // 필터 상태 변경 시 URL 파라미터를 한 번에 업데이트
  useEffect(() => {
    const newParams = new URLSearchParams();
    newParams.set("sort", initialSort);
    if (selectedGender) newParams.set("gender", selectedGender);
    if (selectedBikeType) newParams.set("bikeType", selectedBikeType);
    if (selectedLevel) newParams.set("level", selectedLevel);
    if (selectedLocation) newParams.set("region", selectedLocation);
    if (selectedAvailableTags.length > 0) {
      newParams.set("tags", selectedAvailableTags.join(","));
    }
    setSearchParams(newParams);
  }, [
    selectedGender,
    selectedBikeType,
    selectedLevel,
    selectedLocation,
    selectedAvailableTags,
    initialSort,
    setSearchParams,
  ]);

  return (
    <div className="min-h-screen flex flex-col w-full no-animation">
      <MainNavbar />
      <DateCarousel onDateChange={(date) => setSelectedDate(date)} />

      <div className="flex-1 w-full mx-auto px-4 sm:px-6">
        {/* 필터 드롭다운 섹션 - md 브레이크포인트 사용으로 모바일(md보다 작은 화면)에서만 변경 */}
        <div className="flex flex-wrap md:gap-2 gap-2 md:ml-14 md:justify-start justify-center mt-4">
          {/* 태그 선택 버튼 (모달 오픈) */}
            {selectedAvailableTags.length === 0 ? (
              <button
                className="btn md:btn-sm btn-xs my-1 btn-outline btn-primary rounded-full border-1"
                onClick={() => setIsTagModalOpen(true)}
              >
                태그 
              </button>
            ) : (
                <>
                  <button
                  className="btn md:btn-sm btn-xs my-1 btn-outline btn-primary rounded-full border-1 hover:bg-primary hover:border-primary"
                    onClick={() => setIsTagModalOpen(true)}
                  >
                    태그 {selectedAvailableTags.length}
                  </button>
              </>
            )}

          {/* 성별 드롭다운 (단일 선택) */}
          <div className="dropdown dropdown-bottom">
              <div>
                {!selectedGender ? (
                  <div
                    tabIndex={0}
                    role="button"
                  className="btn md:btn-sm btn-xs my-1 btn-outline text-gray-400 rounded-full border-1 hover:bg-primary hover:border-primary"
                  >
                    성별
                  </div>
                ) : (
                  <div
                    tabIndex={0}
                    role="button"
                    className="btn md:btn-sm btn-xs my-1 btn-outline btn-primary rounded-full border-1"
                  >
                    {selectedGender}
                  </div>
                )}
              </div>
            <ul
              tabIndex={0}
              className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
            >
              {genderTags.map((tag) => (
                <li key={tag}>
                  <a
                    onClick={() => toggleGenderTag(tag)}
                    className={selectedGender === tag ? "active" : ""}
                  >
                    {tag}
                    {selectedGender === tag && (
                      <span className="badge badge-primary badge-sm">✓</span>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* 자전거 타입 드롭다운 - 비슷한 방식으로 수정 */}
          <div className="dropdown dropdown-bottom">
            <div>
              {!selectedBikeType ? (
                <div
                  tabIndex={0}
                  role="button"
                  className="btn md:btn-sm btn-xs my-1 btn-outline text-gray-400 rounded-full border-1 hover:bg-primary hover:border-primary"
                >
                  자전거 타입
                </div>
              ) : (
                <div
                  tabIndex={0}
                  role="button"
                  className="btn md:btn-sm btn-xs my-1 btn-outline btn-primary rounded-full border-1"
                >
                  {selectedBikeType}
                </div>
              )}
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
            >
              {bikeTypeTags.map((tag) => (
                <li key={tag}>
                  <a
                    onClick={() => toggleBikeTypeTag(tag)}
                    className={selectedBikeType === tag ? "active" : ""}
                  >
                    {tag}
                    {selectedBikeType === tag && (
                      <span className="badge badge-primary badge-sm">✓</span>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* 난이도 드롭다운 (단일 선택) */}
          <div className="dropdown dropdown-bottom">
            <div>
              {!selectedLevel ? (
                <div
                  tabIndex={0}
                  role="button"
                  className="btn md:btn-sm btn-xs my-1 btn-outline text-gray-400 rounded-full border-1 hover:bg-primary hover:border-primary"
                >
                  난이도
                </div>
              ) : (
                <div
                  tabIndex={0}
                  role="button"
                  className="btn md:btn-sm btn-xs my-1 btn-outline btn-primary rounded-full border-1"
                >
                    {selectedLevel}
                </div>
              )}
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
            >
              {levelTags.map((tag) => (
                <li key={tag}>
                  <a
                    onClick={() => toggleLevelTag(tag)}
                    className={selectedLevel === tag ? "active" : ""}
                  >
                    {tag}
                    {selectedLevel === tag && (
                      <span className="badge badge-primary badge-sm">✓</span>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* 지역 드롭다운 (단일 선택) */}
          <div className="dropdown dropdown-bottom">
            <div>
              {!selectedLocation ? (
                <div
                  tabIndex={0}
                  role="button"
                  className="btn md:btn-sm btn-xs my-1 btn-outline text-gray-400 rounded-full border-1 hover:bg-primary hover:border-primary"
                >
                  지역
                </div>
              ) : (
                <div
                  tabIndex={0}
                  role="button"
                  className="btn md:btn-sm btn-xs my-1 btn-outline btn-primary rounded-full border-1"
                >
                    {selectedLocation}
                </div>
              )}
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52 max-h-96 overflow-y-auto"
            >
              {locationTags.map((tag) => (
                <li key={tag}>
                  <a
                    onClick={() => toggleLocationTag(tag)}
                    className={selectedLocation === tag ? "active" : ""}
                  >
                    {tag}
                    {selectedLocation === tag && (
                      <span className="badge badge-primary badge-sm">✓</span>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex items-center justify-center">
            {(selectedAvailableTags.length > 0 ||
              selectedGender ||
              selectedBikeType ||
              selectedLevel ||
              selectedLocation) && (
              <>
                <button
                className="btn btn-outline border-red-500 btn-xs btn-circle hover:bg-red-200 hover:border-red-500"
                  onClick={() => {
                  setSelectedAvailableTags([]);
                  setSelectedGender(null);
                  setSelectedBikeType(null);
                  setSelectedLevel(null);
                  setSelectedLocation(null);
                  }}>
                <svg data-Slot="icon" fill="none" strokeWidth={1.5} stroke="red" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
                </button>
              </>
          )}
          </div>
        </div>

        {/* 선택된 필터 태그 표시 영역 */}
        {(selectedAvailableTags.length > 0 ||
          selectedGender ||
          selectedBikeType ||
          selectedLevel ||
          selectedLocation) && (
          <div className="flex flex-wrap md:gap-2 gap-1 mt-4 md:ml-14 md:justify-start justify-center">
            {selectedAvailableTags.map((tag) => (
              <span
                key={tag}
                className="badge badge-primary gap-1 md:text-sm text-xs"
              >
                {tag}
                <button onClick={() => toggleAvailableTag(tag)}>×</button>
              </span>
            ))}
            {selectedGender && (
              <span className="badge badge-primary gap-1 md:text-sm text-xs">
                성별: {selectedGender}
                <button onClick={() => toggleGenderTag(selectedGender)}>
                  ×
                </button>
              </span>
            )}
            {selectedBikeType && (
              <span className="badge badge-primary gap-1 md:text-sm text-xs">
                자전거: {selectedBikeType}
                <button onClick={() => toggleBikeTypeTag(selectedBikeType)}>
                  ×
                </button>
              </span>
            )}
            {selectedLevel && (
              <span className="badge badge-primary gap-1 md:text-sm text-xs">
                난이도: {selectedLevel}
                <button onClick={() => toggleLevelTag(selectedLevel)}>×</button>
              </span>
            )}
            {selectedLocation && (
              <span className="badge badge-primary gap-1 md:text-sm text-xs">
                지역: {selectedLocation}
                <button onClick={() => toggleLocationTag(selectedLocation)}>
                  ×
                </button>
              </span>
            )}
          </div>
        )}

        {/* 번개 생성 버튼 */}
        <div className="fixed bottom-8 right-10 z-50 no-animation">
          <Link to="/lightning/post" className="btn btn-primary btn-circle">
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

        {/* LightningList 컴포넌트 */}
        <LightningList
          sort={initialSort}
          gender={searchParams.get("gender") || ""}
          bikeType={searchParams.get("bikeType") || ""}
          level={searchParams.get("level") || ""}
          region={searchParams.get("region") || ""}
          tags={searchParams.get("tags")?.split(",") || []}
          selectedDate={selectedDate}
        />
      </div>

      {/* 태그 모달 - 모바일 최적화 */}
      {isTagModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box md:w-auto w-11/12 max-w-md">
            <h3 className="font-bold text-lg">태그 선택</h3>
            <div className="py-4">
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleAvailableTag(tag)}
                    className={`btn md:btn-sm btn-xs ${
                      selectedAvailableTags.includes(tag)
                        ? "btn-primary"
                        : "btn-outline"
                    }`}
                  >
                    {tag}
                    {selectedAvailableTags.includes(tag) && " ✓"}
                  </button>
                ))}
              </div>
            </div>
            <div className="modal-action">
              <button className="btn" onClick={() => setIsTagModalOpen(false)}>
                닫기
              </button>
            </div>
          </div>
          <div
            className="modal-backdrop"
            onClick={() => setIsTagModalOpen(false)}
          ></div>
        </div>
      )}
    </div>
  );
}

export default LightningPage;
