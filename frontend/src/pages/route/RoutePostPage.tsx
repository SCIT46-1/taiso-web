import React, { useState } from "react";
import { useNavigate } from "react-router";
import routeService from "../../services/routeService";
import usePost from "../../hooks/usePost";

const TAG_OPTIONS = [
  "한강 자전거길",
  "국토종주길",
  "산악 도로",
  "평지 도로",
  "위험한 공도",
];

const REGION_OPTIONS = [
  "서울",
  "경기",
  "인천",
  "강원",
  "충청",
  "전라",
  "경상",
  "제주",
];
const DISTANCE_TYPE_OPTIONS = ["단거리", "중거리", "장거리"];
const ALTITUDE_TYPE_OPTIONS = ["마운틴", "힐리", "평지"];
const ROAD_TYPE_OPTIONS = ["자전거 도로", "공도", "산길"];

function RoutePostPage() {
  const [routeName, setRouteName] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [region, setRegion] = useState("");
  const [distanceType, setDistanceType] = useState("");
  const [altitudeType, setAltitudeType] = useState("");
  const [roadType, setRoadType] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [serverError, setServerError] = useState("");
  const [formError, setFormError] = useState({
    file: "",
    routeName: "",
    description: "",
    tags: "",
    region: "",
    distanceType: "",
    altitudeType: "",
    roadType: "",
  });
  const navigate = useNavigate();
  const {
    executePost,
    loading,
    error: postError,
  } = usePost(routeService.createRoute);

  // 파일 선택 시 에러 클리어 처리 및 파일 확장자 체크
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      // 허용된 파일 확장자 목록
      const allowedExtensions = ["gpx", "tcx"];
      const fileExtension = file.name.split(".").pop()?.toLowerCase();

      if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
        setFormError((prev) => ({
          ...prev,
          file: "지원되지 않는 파일 확장자입니다. gpx, tcx 파일만 가능합니다.",
        }));
        setSelectedFile(null);
        return;
      }

      setSelectedFile(file);
      setFormError((prev) => ({ ...prev, file: "" }));
    }
  };

  // 태그 선택 토글 함수 (클릭 시 에러 클리어)
  const handleTagToggle = (option: string) => {
    if (tags.includes(option)) {
      setTags(tags.filter((t) => t !== option));
    } else {
      setTags([...tags, option]);
    }
    setFormError((prev) => ({ ...prev, tags: "" }));
  };

  // 각 필드의 값들을 검증하는 함수
  const validateForm = () => {
    const errors = {
      file: "",
      routeName: "",
      description: "",
      tags: "",
      region: "",
      distanceType: "",
      altitudeType: "",
      roadType: "",
    };

    if (!selectedFile) {
      errors.file = "파일을 선택해주세요.";
    }
    if (!routeName.trim()) {
      errors.routeName = "루트 이름은 필수입니다.";
    }
    if (!description.trim()) {
      errors.description = "루트 설명은 필수입니다.";
    }
    if (tags.length === 0) {
      errors.tags = "최소 한 개 이상의 태그를 선택해주세요.";
    }
    if (!region) {
      errors.region = "지역을 선택해주세요.";
    }
    if (!distanceType) {
      errors.distanceType = "거리 타입을 선택해주세요.";
    }
    if (!altitudeType) {
      errors.altitudeType = "고도 타입을 선택해주세요.";
    }
    if (!roadType) {
      errors.roadType = "도로 타입을 선택해주세요.";
    }

    return errors;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // 한 번에 모든 필드 검증
    const errors = validateForm();
    if (Object.values(errors).some((msg) => msg !== "")) {
      setFormError(errors);
      return;
    }

    const payload = {
      routeData: JSON.stringify({
        routeName,
        description,
        tag: tags,
        region,
        distanceType,
        altitudeType,
        roadType,
      }),
      file: selectedFile,
    };

    try {
      const data: any = await executePost(payload);
      navigate(`/route/${data.routeId}`);
    } catch (err) {
      console.error("Error posting route:", err);
      setServerError("루트 등록에 실패했습니다. 잠시 후 다시 시도해주세요.");
    }
  };

  return (
    <div className="flex justify-center items-center relative sm:w-full w-[90%]">
      <div className="w-full max-w-lg bg-base-100">
        <h1 className="text-2xl font-bold text-center mb-4">루트 등록하기</h1>
        <form onSubmit={handleSubmit} noValidate>
          {/* 지도 파일 업로드 */}
          <div className="form-control mb-4">
            <label className="label" htmlFor="file">
              <span className="label-text">지도 파일 업로드</span>
            </label>
            <input
              id="file"
              type="file"
              onChange={handleFileChange}
              className="file-input file-input-md file-input-bordered w-full text-sm"
              accept=".gpx, .tcx"
              required
            />
            {formError.file && (
              <span className="text-red-500 mt-2 block">{formError.file}</span>
            )}
          </div>

          {/* 루트 이름 */}
          <div className="form-control mb-4">
            <label className="label" htmlFor="routeName">
              <span className="label-text">루트 이름</span>
            </label>
            <input
              id="routeName"
              type="text"
              placeholder="루트의 이름을 지어주세요!"
              value={routeName}
              onChange={(e) => {
                setRouteName(e.target.value);
                setFormError((prev) => ({ ...prev, routeName: "" }));
              }}
              className="input input-bordered placeholder:text-sm"
              required
            />
            {formError.routeName && (
              <span className="text-red-500 mt-2 block">
                {formError.routeName}
              </span>
            )}
          </div>

          {/* 루트 설명 */}
          <div className="form-control mb-4">
            <label className="label" htmlFor="description">
              <span className="label-text">루트 설명</span>
            </label>
            <textarea
              id="description"
              placeholder="루트 설명을 적어보세요!"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setFormError((prev) => ({ ...prev, description: "" }));
              }}
              className="textarea textarea-bordered"
              required
            />
            {formError.description && (
              <span className="text-red-500 mt-2 block">
                {formError.description}
              </span>
            )}
          </div>

          {/* 태그 (다중 선택) */}
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">태그</span>
            </label>
            <div className="flex gap-2 flex-wrap">
              {TAG_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`btn ${
                    tags.includes(option) ? "btn-primary" : "btn-outline"
                  } btn-sm`}
                  onClick={() => handleTagToggle(option)}
                >
                  {option}
                </button>
              ))}
            </div>
            {formError.tags && (
              <span className="text-red-500 mt-2 block">{formError.tags}</span>
            )}
          </div>

          {/* 지역 */}
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">지역</span>
            </label>
            <div className="flex gap-2 flex-wrap">
              {REGION_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`btn ${
                    region === option ? "btn-primary" : "btn-outline"
                  } btn-sm`}
                  onClick={() => {
                    setRegion(option);
                    setFormError((prev) => ({ ...prev, region: "" }));
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
            {formError.region && (
              <span className="text-red-500 mt-2 block">
                {formError.region}
              </span>
            )}
          </div>

          {/* 거리 타입 */}
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">거리 타입</span>
            </label>
            <div className="flex gap-2 flex-wrap">
              {DISTANCE_TYPE_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`btn ${
                    distanceType === option ? "btn-primary" : "btn-outline"
                  } btn-sm`}
                  onClick={() => {
                    setDistanceType(option);
                    setFormError((prev) => ({ ...prev, distanceType: "" }));
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
            {formError.distanceType && (
              <span className="text-red-500 mt-2 block">
                {formError.distanceType}
              </span>
            )}
          </div>

          {/* 고도 타입 */}
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">고도 타입</span>
            </label>
            <div className="flex gap-2 flex-wrap">
              {ALTITUDE_TYPE_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`btn ${
                    altitudeType === option ? "btn-primary" : "btn-outline"
                  } btn-sm`}
                  onClick={() => {
                    setAltitudeType(option);
                    setFormError((prev) => ({ ...prev, altitudeType: "" }));
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
            {formError.altitudeType && (
              <span className="text-red-500 mt-2 block">
                {formError.altitudeType}
              </span>
            )}
          </div>

          {/* 도로 타입 */}
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">도로 타입</span>
            </label>
            <div className="flex gap-2 flex-wrap">
              {ROAD_TYPE_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`btn ${
                    roadType === option ? "btn-primary" : "btn-outline"
                  } btn-sm`}
                  onClick={() => {
                    setRoadType(option);
                    setFormError((prev) => ({ ...prev, roadType: "" }));
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
            {formError.roadType && (
              <span className="text-red-500 mt-2 block">
                {formError.roadType}
              </span>
            )}
          </div>

          {/* API 요청 에러 메시지 */}
          {postError && (
            <span className="text-red-500 mb-2 block">{serverError}</span>
          )}

          {/* 제출 버튼 */}
          <div className="form-control mt-6 mb-16">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
      {loading && (
        <div className="absolute inset-0 flex flex-col justify-center items-center  z-50">
          <span
            className="loading loading-spinner loading-lg"
            aria-label="Loading"
          ></span>
          <span className="mt-4">
            루트를 만들고 있습니다. 잠시 기다려주세요...
          </span>
        </div>
      )}
    </div>
  );
}

export default RoutePostPage;
