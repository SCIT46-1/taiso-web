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
      <div className="w-full max-w-lg bg-base-100 p-6">
        <h1 className="text-2xl font-bold text-center mb-4">루트 등록하기</h1>
        <form onSubmit={handleSubmit} noValidate>
          {/* 지도 파일 업로드 */}
          <div className="form-control mb-4">
            <label
              className="label flex items-center gap-1 justify-start"
              htmlFor="file"
            >
              <svg
                data-slot="icon"
                fill="grey"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                className="w-4 h-4"
              >
                <path
                  clipRule="evenodd"
                  fillRule="evenodd"
                  d="M8.157 2.176a1.5 1.5 0 0 0-1.147 0l-4.084 1.69A1.5 1.5 0 0 0 2 5.25v10.877a1.5 1.5 0 0 0 2.074 1.386l3.51-1.452 4.26 1.762a1.5 1.5 0 0 0 1.146 0l4.083-1.69A1.5 1.5 0 0 0 18 14.75V3.872a1.5 1.5 0 0 0-2.073-1.386l-3.51 1.452-4.26-1.762ZM7.58 5a.75.75 0 0 1 .75.75v6.5a.75.75 0 0 1-1.5 0v-6.5A.75.75 0 0 1 7.58 5Zm5.59 2.75a.75.75 0 0 0-1.5 0v6.5a.75.75 0 0 0 1.5 0v-6.5Z"
                />
              </svg>
              <span className="label-text ">지도 파일 업로드</span>
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
            <label
              className="label flex items-center gap-1 justify-start"
              htmlFor="routeName"
            >
              <svg
                data-slot="icon"
                fill="grey"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                className="w-4 h-4"
              >
                <path d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
                <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" />
              </svg>
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
            <label
              className="label flex items-center gap-1 justify-start"
              htmlFor="description"
            >
              <svg
                data-slot="icon"
                fill="grey"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                className="w-4 h-4"
              >
                <path
                  clipRule="evenodd"
                  fillRule="evenodd"
                  d="M2 4.75A.75.75 0 0 1 2.75 4h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 4.75ZM2 10a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 10Zm0 5.25a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75Z"
                />
              </svg>
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

          {/* 지역 */}
          <div className="form-control mb-4">
            <label
              className="label flex items-center gap-1 justify-start"
              htmlFor="region"
            >
              <svg
                data-slot="icon"
                fill="grey"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                className="w-4 h-4"
              >
                <path
                  clipRule="evenodd"
                  fillRule="evenodd"
                  d="m9.69 18.933.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 0 0 .281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 1 0 3 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 0 0 2.273 1.765 11.842 11.842 0 0 0 .976.544l.062.029.018.008.006.003ZM10 11.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z"
                />
              </svg>
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
            <label
              className="label flex items-center gap-1 justify-start"
              htmlFor="distanceType"
            >
              <svg
                data-slot="icon"
                fill="grey"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                className="w-4 h-4"
              >
                <path
                  clipRule="evenodd"
                  fillRule="evenodd"
                  d="M2 10a.75.75 0 0 1 .75-.75h12.59l-2.1-1.95a.75.75 0 1 1 1.02-1.1l3.5 3.25a.75.75 0 0 1 0 1.1l-3.5 3.25a.75.75 0 1 1-1.02-1.1l2.1-1.95H2.75A.75.75 0 0 1 2 10Z"
                />
              </svg>
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
            <label
              className="label flex items-center gap-1 justify-start"
              htmlFor="altitudeType"
            >
              <svg
                data-slot="icon"
                fill="grey"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                className="w-4 h-4"
              >
                <path
                  clipRule="evenodd"
                  fillRule="evenodd"
                  d="M10 18a.75.75 0 0 1-.75-.75V4.66L7.3 6.76a.75.75 0 0 1-1.1-1.02l3.25-3.5a.75.75 0 0 1 1.1 0l3.25 3.5a.75.75 0 1 1-1.1 1.02l-1.95-2.1v12.59A.75.75 0 0 1 10 18Z"
                />
              </svg>
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
            <label
              className="label flex items-center gap-1 justify-start"
              htmlFor="roadType"
            >
              <svg
                data-slot="icon"
                fill="grey"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                className="w-4 h-4"
              >
                <path
                  clipRule="evenodd"
                  fillRule="evenodd"
                  d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z"
                />
              </svg>
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
          {/* 태그 (다중 선택) */}
          <div className="form-control mb-4">
            <label
              className="label flex items-center gap-1 justify-start"
              htmlFor="tags"
            >
              <svg
                data-slot="icon"
                fill="grey"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                className="w-4 h-4"
              >
                <path
                  clipRule="evenodd"
                  fillRule="evenodd"
                  d="M4.5 2A2.5 2.5 0 0 0 2 4.5v3.879a2.5 2.5 0 0 0 .732 1.767l7.5 7.5a2.5 2.5 0 0 0 3.536 0l3.878-3.878a2.5 2.5 0 0 0 0-3.536l-7.5-7.5A2.5 2.5 0 0 0 8.38 2H4.5ZM5 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                />
              </svg>
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

          {/* API 요청 에러 메시지 */}
          {postError && (
            <span className="text-red-500 mb-2 block">{serverError}</span>
          )}

          {/* 제출 버튼 */}
          <div className="form-control mt-6 mb-16">
            <button
              type="submit"
              className="btn btn-primary mt-2"
              disabled={loading}
            >
              {loading ? "등록 중..." : "등록"}
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
