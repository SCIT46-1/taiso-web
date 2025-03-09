import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import RouteModal from "../../components/RouteModal";
import MeetingLocationSelector from "../../components/MapModal";
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
    routeId: "1",
    address: "",
    isClubOnly: false,
    clubId: "",
    tags: [] as string[],
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  console.log(formData);
  console.log(formErrors);

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
    if (!formData.eventDate) errors.eventDate = "이벤트 날짜는 필수입니다.";
    if (!formData.duration) errors.duration = "지속 시간은 필수입니다.";
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
  const handleLocationSelect = (selectedAddress: string, coords: LatLng) => {
    setFormData({
      ...formData,
      address: selectedAddress,
      latitude: coords.lat.toString(),
      longitude: coords.lng.toString(),
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerError("");

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
    <>
      {/* 루트 등록 모달 */}
      <input type="checkbox" id="route_modal" className="modal-toggle" />
      <div className="modal" role="dialog">
        <div className="modal-box">
          <RouteModal />
          <div className="modal-action">
            <label htmlFor="route_modal" className="btn">
              Close!
            </label>
          </div>
        </div>
      </div>
      {/* 번개 등록 폼 */}
      <div className="flex justify-center items-center relative sm:w-full w-[90%]">
        <div className="w-full max-w-lg bg-base-100 p-6">
          <h1 className="text-2xl font-bold text-center mb-4">번개 등록하기</h1>
          {serverError && (
            <p className="text-red-500 mb-4 text-center">{serverError}</p>
          )}
          <form onSubmit={handleSubmit} noValidate>
            {/* 제목 */}
            <div className="form-control mb-4">
              <label htmlFor="title" className="label">
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
                className="input input-bordered placeholder:text-sm"
              />
              {formErrors.title && (
                <span className="text-red-500 mt-2 block">
                  {formErrors.title}
                </span>
              )}
            </div>

            {/* 설명 */}
            <div className="form-control mb-4">
              <label htmlFor="description" className="label">
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
                className="textarea textarea-bordered"
              ></textarea>
              {formErrors.description && (
                <span className="text-red-500 mt-2 block">
                  {formErrors.description}
                </span>
              )}
            </div>

            {/* 이벤트 날짜 */}
            <div className="form-control mb-4">
              <label htmlFor="eventDate" className="label">
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
                className="input input-bordered"
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
                <label htmlFor="duration" className="label">
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
                  className="input input-bordered placeholder:text-sm"
                />
                {formErrors.duration && (
                  <span className="text-red-500 mt-2 block">
                    {formErrors.duration}
                  </span>
                )}
              </div>
            </div>

            {/* 최대 인원, 위치 선택 */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="form-control">
                <label htmlFor="capacity" className="label">
                  <span className="label-text">최대 참여가능 인원 (명)</span>
                </label>
                <input
                  id="capacity"
                  type="number"
                  placeholder="예: 10"
                  value={formData.capacity}
                  onChange={(e) => {
                    setFormData({ ...formData, capacity: e.target.value });
                    setFormErrors((prev) => ({ ...prev, capacity: "" }));
                  }}
                  className="input input-bordered placeholder:text-sm"
                />
                {formErrors.capacity && (
                  <span className="text-red-500 mt-2 block">
                    {formErrors.capacity}
                  </span>
                )}
              </div>
              <label htmlFor="map_modal">
                <MeetingLocationSelector
                  onSelectLocation={handleLocationSelect}
                />
              </label>
            </div>

            {/* 지역 */}
            <div className="mb-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">지역</span>
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
                      className={`btn btn-sm ${
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
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* 성별 선택 */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">성별</span>
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
                      className={`btn ${
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

              {/* 레벨 선택 */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">레벨</span>
                </label>
                <div className="flex gap-2">
                  {LEVEL_OPTIONS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, level: option });
                        setFormErrors((prev) => ({ ...prev, level: "" }));
                      }}
                      className={`btn ${
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
            </div>

            {/* 모집 유형, 자전거 종류 */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">모집 유형</span>
                </label>
                <div className="flex gap-2 flex-wrap">
                  {RECRUIT_TYPE_OPTIONS.map((option) => (
                    <div
                      className="tooltip no-animation"
                      data-tip={
                        option === "참가형"
                          ? "참가자가 자유롭게 참가 할 수 있어요!"
                          : "참가자가 신청을 하면 승낙을 해야 해요!"
                      }
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, recruitType: option });
                          setFormErrors((prev) => ({
                            ...prev,
                            recruitType: "",
                          }));
                        }}
                        className={`btn btn-sm ${
                          formData.recruitType === option
                            ? "btn-primary"
                            : "btn-outline"
                        }`}
                      >
                        {option}
                      </button>
                    </div>
                  ))}
                </div>
                {formErrors.recruitType && (
                  <span className="text-red-500 mt-2 block">
                    {formErrors.recruitType}
                  </span>
                )}
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">자전거 종류</span>
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
                      className={`btn btn-sm ${
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
            </div>

            {/* 거리, 경로 ID */}
            <div className="grid grid-cols-2 gap-4 mb-4">
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
              <label htmlFor="route_modal" className="btn">
                경로 등록
              </label>
            </div>

            {/* 주소 */}
            <div className="form-control mb-4">
              <label htmlFor="address" className="label">
                <span className="label-text">주소</span>
              </label>
              <input
                id="address"
                type="text"
                placeholder="예: 서울특별시 강남구"
                value={formData.address}
                onChange={(e) => {
                  setFormData({ ...formData, address: e.target.value });
                  setFormErrors((prev) => ({ ...prev, address: "" }));
                }}
                className="input input-bordered placeholder:text-sm"
              />
              {formErrors.address && (
                <span className="text-red-500 mt-2 block">
                  {formErrors.address}
                </span>
              )}
            </div>

            {/* 클럽 전용 여부 및 클럽 ID
            <div className="form-control mb-4">
              <label className="cursor-pointer label">
                <span className="label-text">클럽 전용 이벤트</span>
                <input
                  type="checkbox"
                  checked={formData.isClubOnly}
                  onChange={(e) =>
                    setFormData({ ...formData, isClubOnly: e.target.checked })
                  }
                  className="checkbox checkbox-primary"
                />
              </label>
              {formData.isClubOnly && (
                <div className="mt-2">
                  <label htmlFor="clubId" className="label">
                    <span className="label-text">클럽 ID</span>
                  </label>
                  <input
                    id="clubId"
                    type="number"
                    placeholder="클럽 ID 입력"
                    value={formData.clubId}
                    onChange={(e) => {
                      setFormData({ ...formData, clubId: e.target.value });
                      setFormErrors((prev) => ({ ...prev, clubId: "" }));
                    }}
                    className="input input-bordered placeholder:text-sm"
                  />
                  {formErrors.clubId && (
                    <span className="text-red-500 mt-2 block">
                      {formErrors.clubId}
                    </span>
                  )}
                </div>
              )}
            </div> */}

            {/* 태그 */}
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">태그</span>
              </label>
              <div className="flex gap-2 flex-wrap">
                {TAG_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleTagToggle(option)}
                    className={`btn btn-sm ${
                      formData.tags.includes(option)
                        ? "btn-primary"
                        : "btn-outline"
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
    </>
  );
}

export default LightningPostPage;
