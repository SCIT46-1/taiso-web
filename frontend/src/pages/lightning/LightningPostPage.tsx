import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import RouteModal from "../../components/RouteModal";
import KakaolocationMap from "../../components/KakaolocationMap";
import MeetingLocationSelector from "../../components/MapModal";
import ImageWithSkeleton from "../../components/ImageWithSkeleton";
import lightningService, {
  LightningPostRequest,
} from "../../services/lightningService";

// 옵션 상수들
const GENDER_OPTIONS = ["자유", "남", "여"];
const LEVEL_OPTIONS = ["초보", "중급", "고급", "자유"];
const RECRUIT_TYPE_OPTIONS = ["참가형", "수락형"];
const BIKE_TYPE_OPTIONS = ["로드", "따릉이", "하이브리드", "자유"];
const REGION_OPTIONS = ["서울", "경기", "대구", "강원"];
const TAG_OPTIONS = [
  "장거리",
  "친목",
  "가볍게",
  "따릉이",
  "아마추어",
  "훈련",
  "샤방",
  "커피 라이딩",
  "초 장거리",
  "무보급",
  "무정차",
];

interface LatLng {
  lat: number;
  lng: number;
}

interface FormErrors {
  title?: string;
  description?: string;
  eventDate?: string;
  duration?: string;
  status?: string;
  capacity?: string;
  latitude?: string;
  longitude?: string;
  gender?: string;
  level?: string;
  recruitType?: string;
  bikeType?: string;
  region?: string;
  distance?: string;
  routeId?: string;
  address?: string;
  tags?: string;
  clubId?: string;
}

function LightningPostPage() {
  const [searchParams] = useSearchParams();
  const clubId = searchParams.get("clubId");
  const isClubOnly = searchParams.get("isClubOnly") === "true";

  // 모든 폼 상태를 하나의 객체로 관리
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    eventDate: "",
    duration: "",
    capacity: "",
    latitude: "",
    longitude: "",
    gender: "자유",
    level: "",
    recruitType: "참가형",
    bikeType: "",
    region: "",
    distance: "",
    routeId: "",
    address: "",
    isClubOnly: isClubOnly || false,
    clubId: clubId || "",
    tags: [] as string[],
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Add new state for selected route name and distance
  const [selectedRoute, setSelectedRoute] = useState({
    id: "",
    name: "",
    distance: "",
  });

  // Add state to track if form has been submitted once (for showing errors)
  const [formSubmitted, setFormSubmitted] = useState(false);

  console.log(formData);
  console.log(formErrors);

  // Add effect to handle club-only parameters
  useEffect(() => {
    if (isClubOnly && clubId) {
      setFormData((prev) => ({
        ...prev,
        isClubOnly: true,
        clubId: clubId,
      }));
    }
  }, [isClubOnly, clubId]);

  // 태그 토글 함수
  const handleTagToggle = (option: string) => {
    const updatedTags = formData.tags.includes(option)
      ? formData.tags.filter((t) => t !== option)
      : [...formData.tags, option];
    setFormData({ ...formData, tags: updatedTags });
    setFormErrors((prev) => ({ ...prev, tags: "" }));
  };

  // 전체 필드 검증 함수
  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!formData.title.trim()) errors.title = "제목은 필수입니다.";
    if (!formData.description.trim()) errors.description = "설명은 필수입니다.";
    if (!formData.eventDate) errors.eventDate = "모임 날짜는 필수입니다.";
    if (!formData.duration) errors.duration = "예상 소요시간은 필수입니다.";
    if (!formData.capacity) errors.capacity = "최대 인원 수를 입력해주세요.";
    if (!formData.latitude) errors.latitude = "위도를 입력해주세요.";
    if (!formData.longitude) errors.longitude = "경도를 입력해주세요.";
    if (!formData.gender) errors.gender = "성별을 선택해주세요.";
    if (!formData.level) errors.level = "레벨을 선택해주세요.";
    if (!formData.recruitType) errors.recruitType = "모집 유형을 선택해주세요.";
    if (!formData.bikeType) errors.bikeType = "자전거 종류를 선택해주세요.";
    if (!formData.region) errors.region = "지역을 선택해주세요.";
    if (!formData.distance) errors.distance = "거리를 입력해주세요.";
    if (!formData.routeId) errors.routeId = "경로 ID를 입력해주세요.";
    if (!formData.address.trim()) errors.address = "주소를 입력해주세요.";
    if (formData.tags.length === 0)
      errors.tags = "최소 한 개 이상의 태그를 선택해주세요.";
    if (formData.isClubOnly && !formData.clubId)
      errors.clubId = "클럽 전용 이벤트인 경우 클럽 ID를 입력해주세요.";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // MeetingLocationSelector에서 선택한 주소와 좌표를 저장하는 콜백 함수
  const handleLocationSelect = (
    selectedAddress: string,
    coords: LatLng,
    locationName?: string
  ) => {
    setFormData({
      ...formData,
      address: locationName || selectedAddress,
      latitude: coords.lat.toString(),
      longitude: coords.lng.toString(),
    });
  };

  // Add a new handler for route selection
  const handleRouteSelect = (
    routeId: number,
    routeName: string,
    distance: number
  ) => {
    setFormData({
      ...formData,
      routeId: routeId.toString(),
      distance: distance.toString(),
    });
    setSelectedRoute({
      id: routeId.toString(),
      name: routeName,
      distance: distance.toString(),
    });
    setFormErrors((prev) => ({ ...prev, routeId: "", distance: "" }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerError("");
    setFormSubmitted(true); // Set this to true on form submission attempt

    if (!validateForm()) return;

    // 숫자형 필드 변환 후 payload 구성
    const payload: LightningPostRequest = {
      title: formData.title,
      description: formData.description,
      eventDate: formData.eventDate,
      duration: Number(formData.duration),
      capacity: Number(formData.capacity),
      latitude: Number(formData.latitude),
      longitude: Number(formData.longitude),
      status: "모집",
      gender: formData.gender,
      level: formData.level,
      recruitType: formData.recruitType,
      bikeType: formData.bikeType,
      region: formData.region,
      distance: Number(formData.distance),
      routeId: Number(formData.routeId),
      address: formData.address,
      isClubOnly: formData.isClubOnly,
      clubId: formData.clubId ? Number(formData.clubId) : null,
      tags: formData.tags,
    };

    console.log("Payload:", payload);
    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const response = await lightningService.createLightning(payload);
      console.log("Response:", response);
      navigate("/lightning");
    } catch (error) {
      console.error("이벤트 등록 에러:", error);
      setServerError("이벤트 등록에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="no-animation">
      {/* 루트 등록 모달 */}
      <input type="checkbox" id="route_modal" className="modal-toggle" />
      <div className="modal" role="dialog">
        <div className="modal-box w-11/12 max-w-5xl">
          <RouteModal
            onSelectRoute={handleRouteSelect}
            selectedRouteId={
              formData.routeId ? Number(formData.routeId) : undefined
            }
          />
          <div className="modal-action">
            <label htmlFor="route_modal" className="btn">
              닫기
            </label>
          </div>
        </div>
      </div>
      {/* 번개 등록 폼 */}
      <div className="flex justify-center items-center relative sm:w-full">
        <div className="w-full max-w-lg bg-base-100 p-4">
          <h1 className="text-2xl font-bold text-center mb-4">
            {isClubOnly ? "클럽 전용 번개 등록하기" : "번개 등록하기"}
          </h1>
          {serverError && (
            <p className="text-red-500 mb-4 text-center">{serverError}</p>
          )}
          <form onSubmit={handleSubmit} noValidate>
            {/* 제목 */}
            <div className="form-control mb-4">
              <label
                htmlFor="title"
                className="label flex items-center gap-2 justify-start"
              >
                <svg
                  data-slot="icon"
                  fill="grey"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                  className="w-5 h-5"
                >
                  <path
                    clipRule="evenodd"
                    fillRule="evenodd"
                    d="M2 4.75A.75.75 0 0 1 2.75 4h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 4.75Zm0 10.5a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1-.75-.75ZM2 10a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 10Z"
                  />
                </svg>
                <span className="label-text">제목</span>
              </label>
              <input
                id="title"
                type="text"
                placeholder="번개의 제목을 작성해보세요!  (예: 한강 라이딩 모임)"
                value={formData.title}
                onChange={(e) => {
                  setFormData({ ...formData, title: e.target.value });
                  setFormErrors((prev) => ({ ...prev, title: "" }));
                }}
                className="input input-bordered placeholder:text-sm focus:input-primary"
              />
              {formErrors.title && (
                <span className="text-red-500 mt-2 block">
                  {formErrors.title}
                </span>
              )}
            </div>

            {/* 설명 */}
            <div className="form-control mb-4">
              <label
                htmlFor="description"
                className="label flex items-center gap-2 justify-start"
              >
                <svg
                  data-slot="icon"
                  fill="grey"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                  className="w-5 h-5"
                >
                  <path
                    clipRule="evenodd"
                    fillRule="evenodd"
                    d="M10 2c-2.236 0-4.43.18-6.57.524C1.993 2.755 1 4.014 1 5.426v5.148c0 1.413.993 2.67 2.43 2.902 1.168.188 2.352.327 3.55.414.28.02.521.18.642.413l1.713 3.293a.75.75 0 0 0 1.33 0l1.713-3.293a.783.783 0 0 1 .642-.413 41.102 41.102 0 0 0 3.55-.414c1.437-.231 2.43-1.49 2.43-2.902V5.426c0-1.413-.993-2.67-2.43-2.902A41.289 41.289 0 0 0 10 2ZM6.75 6a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Zm0 2.5a.75.75 0 0 0 0 1.5h3.5a.75.75 0 0 0 0-1.5h-3.5Z"
                  />
                </svg>
                <span className="label-text">설명</span>
              </label>
              <textarea
                id="description"
                placeholder="번개의 자세한 설명을 작성해보세요!  (예: 초보자도 환영! 함께 달려요.)"
                value={formData.description}
                onChange={(e) => {
                  setFormData({ ...formData, description: e.target.value });
                  setFormErrors((prev) => ({ ...prev, description: "" }));
                }}
                className="textarea textarea-bordered focus:input-primary min-h-40 h-auto"
              ></textarea>
              {formErrors.description && (
                <span className="text-red-500 mt-2 block">
                  {formErrors.description}
                </span>
              )}
            </div>

            {/* 이벤트 날짜 */}
            <div className="form-control mb-4">
              <label
                htmlFor="eventDate"
                className="label flex items-center gap-2 justify-start"
              >
                <svg
                  data-slot="icon"
                  fill="grey"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                  className="w-5 h-5"
                >
                  <path d="M5.25 12a.75.75 0 0 1 .75-.75h.01a.75.75 0 0 1 .75.75v.01a.75.75 0 0 1-.75.75H6a.75.75 0 0 1-.75-.75V12ZM6 13.25a.75.75 0 0 0-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 0 0 .75-.75V14a.75.75 0 0 0-.75-.75H6ZM7.25 12a.75.75 0 0 1 .75-.75h.01a.75.75 0 0 1 .75.75v.01a.75.75 0 0 1-.75.75H8a.75.75 0 0 1-.75-.75V12ZM8 13.25a.75.75 0 0 0-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 0 0 .75-.75V14a.75.75 0 0 0-.75-.75H8ZM9.25 10a.75.75 0 0 1 .75-.75h.01a.75.75 0 0 1 .75.75v.01a.75.75 0 0 1-.75.75H10a.75.75 0 0 1-.75-.75V10ZM10 11.25a.75.75 0 0 0-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 0 0 .75-.75V12a.75.75 0 0 0-.75-.75H10ZM9.25 14a.75.75 0 0 1 .75-.75h.01a.75.75 0 0 1 .75.75v.01a.75.75 0 0 1-.75.75H10a.75.75 0 0 1-.75-.75V14ZM12 9.25a.75.75 0 0 0-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 0 0 .75-.75V10a.75.75 0 0 0-.75-.75H12ZM11.25 12a.75.75 0 0 1 .75-.75h.01a.75.75 0 0 1 .75.75v.01a.75.75 0 0 1-.75.75H12a.75.75 0 0 1-.75-.75V12ZM12 13.25a.75.75 0 0 0-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 0 0 .75-.75V14a.75.75 0 0 0-.75-.75H12ZM13.25 10a.75.75 0 0 1 .75-.75h.01a.75.75 0 0 1 .75.75v.01a.75.75 0 0 1-.75.75H14a.75.75 0 0 1-.75-.75V10ZM14 11.25a.75.75 0 0 0-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 0 0 .75-.75V12a.75.75 0 0 0-.75-.75H14Z" />
                  <path
                    clipRule="evenodd"
                    fillRule="evenodd"
                    d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z"
                  />
                </svg>
                <span className="label-text">번개 모임 일시</span>
              </label>
              <input
                id="eventDate"
                type="datetime-local"
                value={formData.eventDate}
                onChange={(e) => {
                  setFormData({ ...formData, eventDate: e.target.value });
                  setFormErrors((prev) => ({ ...prev, eventDate: "" }));
                }}
                className="input input-bordered focus:input-primary"
              />
              {formErrors.eventDate && (
                <span className="text-red-500 mt-2 block">
                  {formErrors.eventDate}
                </span>
              )}
            </div>

            {/* 지속 시간 */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="form-control">
                <label
                  htmlFor="duration"
                  className="label flex items-center gap-2 justify-start"
                >
                  <svg
                    data-slot="icon"
                    fill="grey"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                    className="w-5 h-5"
                  >
                    <path
                      clipRule="evenodd"
                      fillRule="evenodd"
                      d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 0 0 0-1.5h-3.25V5Z"
                    />
                  </svg>
                  <span className="label-text">번개 예상 소요시간 (분)</span>
                </label>
                <input
                  id="duration"
                  type="number"
                  placeholder="예: 120 (2시간)"
                  value={formData.duration}
                  onChange={(e) => {
                    setFormData({ ...formData, duration: e.target.value });
                    setFormErrors((prev) => ({ ...prev, duration: "" }));
                  }}
                  className="input input-bordered placeholder:text-sm focus:input-primary"
                />
                {formErrors.duration && (
                  <span className="text-red-500 mt-2 block">
                    {formErrors.duration}
                  </span>
                )}
              </div>
              <div className="form-control mx-auto">
                <label
                  htmlFor="capacity"
                  className="label flex items-center gap-2 justify-start"
                >
                  <svg
                    data-slot="icon"
                    fill="grey"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                    className="w-5 h-5"
                  >
                    <path d="M7 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM14.5 9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM1.615 16.428a1.224 1.224 0 0 1-.569-1.175 6.002 6.002 0 0 1 11.908 0c.058.467-.172.92-.57 1.174A9.953 9.953 0 0 1 7 18a9.953 9.953 0 0 1-5.385-1.572ZM14.5 16h-.106c.07-.297.088-.611.048-.933a7.47 7.47 0 0 0-1.588-3.755 4.502 4.502 0 0 1 5.874 2.636.818.818 0 0 1-.36.98A7.465 7.465 0 0 1 14.5 16Z" />
                  </svg>
                  <span className="label-text">최대 참여가능 인원 (명)</span>
                </label>
                <div className="join w-full">
                  <button
                    type="button"
                    className="btn join-item bg-gray-200"
                    onClick={() => {
                      const currentValue = parseInt(formData.capacity) || 0;
                      if (currentValue > 1) {
                        setFormData({
                          ...formData,
                          capacity: (currentValue - 1).toString(),
                        });
                      }
                    }}
                  >
                    -
                  </button>
                  <input
                    id="capacity"
                    type="number"
                    placeholder="예: 10"
                    value={formData.capacity}
                    onChange={(e) => {
                      setFormData({ ...formData, capacity: e.target.value });
                      setFormErrors((prev) => ({ ...prev, capacity: "" }));
                    }}
                    className="input mr-3 w-full join-item px-0 text-center focus:outline-none focus:border-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <button
                    type="button"
                    className="btn join-item bg-gray-200"
                    onClick={() => {
                      const currentValue = parseInt(formData.capacity) || 0;
                      setFormData({
                        ...formData,
                        capacity: (currentValue + 1).toString(),
                      });
                    }}
                  >
                    +
                  </button>
                </div>
                {formErrors.capacity && (
                  <span className="text-red-500 mt-2 block">
                    {formErrors.capacity}
                  </span>
                )}
              </div>
            </div>

            {/* 최대 인원, 위치 선택 */}
            <div className="grid grid-cols-1 gap-4 mb-4">
              <div>
                <label
                  htmlFor="map_modal"
                  className="flex items-center gap-2 justify-start mb-2 ml-1"
                >
                  <svg
                    data-slot="icon"
                    fill="grey"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                    className="w-5 h-5"
                  >
                    <path
                      clipRule="evenodd"
                      fillRule="evenodd"
                      d="m9.69 18.933.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 0 0 .281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 1 0 3 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 0 0 2.273 1.765 11.842 11.842 0 0 0 .976.544l.062.029.018.008.006.003ZM10 11.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z"
                    />
                  </svg>
                  <div className="label-text">모임 시작 장소 선택하기</div>
                </label>
                <MeetingLocationSelector
                  onSelectLocation={handleLocationSelect}
                  selectedAddress={formData.address || ""}
                />
                {formSubmitted && formErrors.address && (
                  <span className="text-red-500 mt-2 block">
                    {formErrors.address}
                  </span>
                )}
                <input
                  id="address"
                  type="text"
                  placeholder="모임 장소를 등록 해주세요."
                  value={formData.address}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                  className="input input-bordered w-full placeholder:text-sm focus:input-primary my-2"
                />
                {formData.address && (
                  <span className="text-sm text-red-500">
                    *주소가 아닌 간단 위치를 직접 입력 할 수 있습니다! (ex:
                    잠실역 8번 출구)
                  </span>
                )}
                <div className="mt-3">
                  {formData.address && (
                    <KakaolocationMap
                      lat={Number(formData.latitude)}
                      lng={Number(formData.longitude)}
                      width="full"
                      height="300px"
                    />
                  )}
                </div>
              </div>

              <div className="-mt-2">
                <label className="label flex items-center gap-2 justify-start">
                  <svg
                    data-slot="icon"
                    fill="grey"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                    className="w-5 h-5"
                  >
                    <path
                      clipRule="evenodd"
                      fillRule="evenodd"
                      d="M8.157 2.176a1.5 1.5 0 0 0-1.147 0l-4.084 1.69A1.5 1.5 0 0 0 2 5.25v10.877a1.5 1.5 0 0 0 2.074 1.386l3.51-1.452 4.26 1.762a1.5 1.5 0 0 0 1.146 0l4.083-1.69A1.5 1.5 0 0 0 18 14.75V3.872a1.5 1.5 0 0 0-2.073-1.386l-3.51 1.452-4.26-1.762ZM7.58 5a.75.75 0 0 1 .75.75v6.5a.75.75 0 0 1-1.5 0v-6.5A.75.75 0 0 1 7.58 5Zm5.59 2.75a.75.75 0 0 0-1.5 0v6.5a.75.75 0 0 0 1.5 0v-6.5Z"
                    />
                  </svg>
                  <div className="label-text">번개 경로 선택하기</div>
                </label>
                <label
                  htmlFor="route_modal"
                  className={`btn w-full ${
                    selectedRoute.id
                      ? "bg-gray-200"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  }`}
                >
                  {selectedRoute.id ? "경로 재등록" : "경로 등록"}
                </label>

                {formSubmitted && formErrors.routeId && (
                  <span className="text-red-500 mt-2 block">
                    {formErrors.routeId}
                  </span>
                )}
              </div>
            </div>
            {/* 경로이름, 거리 */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="form-control">
                <label htmlFor="route" className="label">
                  <span className="label-text">코스</span>
                </label>
                <input
                  id="route"
                  type="string"
                  placeholder="예: 옷걸이 코스"
                  value={selectedRoute.name}
                  onChange={(e) => {
                    setFormData({ ...formData, distance: e.target.value });
                    setFormErrors((prev) => ({ ...prev, distance: "" }));
                  }}
                  className="input input-bordered placeholder:text-sm"
                />
                {formErrors.distance && (
                  <span className="text-red-500 mt-2 block">
                    {formErrors.distance}
                  </span>
                )}
              </div>

              <div className="form-control">
                <label htmlFor="distance" className="label">
                  <span className="label-text">거리 (km)</span>
                </label>
                <input
                  id="distance"
                  type="number"
                  placeholder="예: 25"
                  value={formData.distance}
                  onChange={(e) => {
                    setFormData({ ...formData, distance: e.target.value });
                    setFormErrors((prev) => ({ ...prev, distance: "" }));
                  }}
                  className="input input-bordered placeholder:text-sm"
                />
                {formErrors.distance && (
                  <span className="text-red-500 mt-2 block">
                    {formErrors.distance}
                  </span>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 mb-4">
              {/* 경로 이미지 */}
              {selectedRoute.id && (
                <ImageWithSkeleton
                  src="https://img.daisyui.com/images/stock/photo-1559703248-dcaaec9fab78.webp"
                  alt={selectedRoute.name}
                  className="w-full h-300"
                />
              )}
            </div>

            {/* 모집 유형 */}
            <div className="mb-4 no-animation">
              <label className="label flex items-center gap-2 justify-start">
                <svg
                  data-slot="icon"
                  fill="grey"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                  className="w-5 h-5"
                >
                  <path d="M10 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM6 8a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM1.49 15.326a.78.78 0 0 1-.358-.442 3 3 0 0 1 4.308-3.516 6.484 6.484 0 0 0-1.905 3.959c-.023.222-.014.442.025.654a4.97 4.97 0 0 1-2.07-.655ZM16.44 15.98a4.97 4.97 0 0 0 2.07-.654.78.78 0 0 0 .357-.442 3 3 0 0 0-4.308-3.517 6.484 6.484 0 0 1 1.907 3.96 2.32 2.32 0 0 1-.026.654ZM18 8a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM5.304 16.19a.844.844 0 0 1-.277-.71 5 5 0 0 1 9.947 0 .843.843 0 0 1-.277.71A6.975 6.975 0 0 1 10 18a6.974 6.974 0 0 1-4.696-1.81Z" />
                </svg>
                <span className="label-text font-medium mr-auto">
                  모집 유형
                </span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                {RECRUIT_TYPE_OPTIONS.map((option) => (
                  <div
                    key={option}
                    onClick={() => {
                      setFormData({ ...formData, recruitType: option });
                      setFormErrors((prev) => ({
                        ...prev,
                        recruitType: "",
                      }));
                    }}
                    className={`card cursor-pointer min-h-[80px] bg-base-100 p-1 ${
                      formData.recruitType === option
                        ? "border-[1px] border-primary ring-1 ring-primary shadow-sm text-primary"
                        : "border border-gray-300 "
                    }`}
                  >
                    <div className="card-body p-4 flex flex-col justify-center">
                      <h3 className="card-title text-center justify-center text-base">
                        {option}
                      </h3>
                      <p className="text-sm text-center mt-2">
                        {option === "참가형" ? (
                          <>
                            선착순으로 누구나 자유롭게
                            <br />
                            참가 할 수 있어요!
                          </>
                        ) : (
                          <>
                            신청을 받고 수락을 통해 <br />
                            참가 할 수 있어요!
                          </>
                        )}
                      </p>
                      {formData.recruitType === option && (
                        <div className="absolute top-2 right-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-primary"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {formErrors.recruitType && (
                <span className="text-red-500 mt-2 block">
                  {formErrors.recruitType}
                </span>
              )}
            </div>

            {/* 통합 선택 옵션 섹션 */}
            <div className="form-control mb-6 rounded-lg gap-2">
              <div className="flex items-center gap-2 ">
                <svg
                  data-slot="icon"
                  fill="grey"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                  className="w-5 h-5"
                >
                  <path
                    clipRule="evenodd"
                    fillRule="evenodd"
                    d="M4.5 2A2.5 2.5 0 0 0 2 4.5v3.879a2.5 2.5 0 0 0 .732 1.767l7.5 7.5a2.5 2.5 0 0 0 3.536 0l3.878-3.878a2.5 2.5 0 0 0 0-3.536l-7.5-7.5A2.5 2.5 0 0 0 8.38 2H4.5ZM5 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                  />
                </svg>
                <span className="label-text font-medium mr-auto">
                  태그 선택
                </span>
              </div>
              {/* 지역 */}
              <div className="">
                <label className="label flex items-center gap-1 justify-start text-blue-500">
                  <svg
                    data-Slot="icon"
                    fill="none"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5-3.9 19.5m-2.1-19.5-3.9 19.5"
                    />
                  </svg>
                  <span className="label-text font-semibold text-blue-500">
                    지역
                  </span>
                </label>
                <div className="flex gap-2 flex-wrap">
                  {REGION_OPTIONS.map((option) => (
                    <button
                      type="button"
                      key={option}
                      onClick={() => {
                        setFormData({ ...formData, region: option });
                        setFormErrors((prev) => ({ ...prev, region: "" }));
                      }}
                      className={`btn px-5 rounded-full flex items-center justify-center ${
                        formData.region === option
                          ? "btn-primary"
                          : "btn-outline"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                {formErrors.region && (
                  <span className="text-red-500 mt-2 block">
                    {formErrors.region}
                  </span>
                )}
              </div>

              {/* 성별 */}
              <div className="">
                <label className="label flex items-center gap-1 justify-start text-blue-500">
                  <svg
                    data-Slot="icon"
                    fill="none"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5-3.9 19.5m-2.1-19.5-3.9 19.5"
                    />
                  </svg>
                  <span className="label-text font-semibold text-blue-500">
                    성별
                  </span>
                </label>
                <div className="flex gap-2">
                  {GENDER_OPTIONS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, gender: option });
                        setFormErrors((prev) => ({ ...prev, gender: "" }));
                      }}
                      className={`btn px-5 rounded-full flex items-center justify-center ${
                        formData.gender === option
                          ? "btn-primary"
                          : "btn-outline"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                {formErrors.gender && (
                  <span className="text-red-500 mt-2 block">
                    {formErrors.gender}
                  </span>
                )}
              </div>

              {/* 레벨 */}
              <div className="">
                <label className="label flex items-center gap-1 justify-start text-blue-500">
                  <svg
                    data-Slot="icon"
                    fill="none"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5-3.9 19.5m-2.1-19.5-3.9 19.5"
                    />
                  </svg>
                  <span className="label-text font-semibold text-blue-500">
                    레벨
                  </span>
                </label>
                <div className="flex gap-2 flex-wrap">
                  {LEVEL_OPTIONS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, level: option });
                        setFormErrors((prev) => ({ ...prev, level: "" }));
                      }}
                      className={`btn px-5 rounded-full flex items-center justify-center ${
                        formData.level === option
                          ? "btn-primary"
                          : "btn-outline"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                {formErrors.level && (
                  <span className="text-red-500 mt-2 block">
                    {formErrors.level}
                  </span>
                )}
              </div>

              {/* 자전거 종류 */}
              <div className="">
                <label className="label flex items-center gap-1 justify-start text-blue-500">
                  <svg
                    data-Slot="icon"
                    fill="none"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5-3.9 19.5m-2.1-19.5-3.9 19.5"
                    />
                  </svg>
                  <span className="label-text font-semibold text-blue-500">
                    자전거 종류
                  </span>
                </label>
                <div className="flex gap-2 flex-wrap">
                  {BIKE_TYPE_OPTIONS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, bikeType: option });
                        setFormErrors((prev) => ({ ...prev, bikeType: "" }));
                      }}
                      className={`btn px-5 rounded-full flex items-center justify-center ${
                        formData.bikeType === option
                          ? "btn-primary"
                          : "btn-outline"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                {formErrors.bikeType && (
                  <span className="text-red-500 mt-2 block">
                    {formErrors.bikeType}
                  </span>
                )}
              </div>

              {/* 태그 */}
              <div>
                <label className="label flex items-center gap-1 justify-start text-blue-500">
                  <svg
                    data-Slot="icon"
                    fill="none"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5-3.9 19.5m-2.1-19.5-3.9 19.5"
                    />
                  </svg>
                  <span className="label-text font-semibold text-blue-500">
                    태그
                  </span>
                </label>
                <div className="flex gap-2 flex-wrap">
                  {TAG_OPTIONS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleTagToggle(option)}
                      className={`btn px-5 rounded-full flex items-center justify-center ${
                        formData.tags.includes(option)
                          ? "btn-primary"
                          : "btn-outline "
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                {formErrors.tags && (
                  <span className="text-red-500 mt-2 block">
                    {formErrors.tags}
                  </span>
                )}
              </div>
            </div>

            {/* Add club-only indicator when creating a club-only lightning */}
            {isClubOnly && clubId && (
              <div className="alert alert-info mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="stroke-current shrink-0 w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                <span>클럽 전용 번개로 등록됩니다.</span>
              </div>
            )}

            {/* 제출 버튼 */}
            <div className="form-control mt-6 mb-16">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? "등록 중..." : "이벤트 등록"}
              </button>
            </div>
          </form>
        </div>
        {loading && (
          <div className="absolute inset-0 flex flex-col justify-center items-center z-50">
            <span
              className="loading loading-spinner loading-lg"
              aria-label="Loading"
            ></span>
            <span className="mt-4">
              번개 등록 중입니다. 잠시 기다려주세요...
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default LightningPostPage;
