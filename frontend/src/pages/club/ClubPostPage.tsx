import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import clubService, { ClubCreateRequest } from "../../services/clubService";

function ClubPostPage() {
  const navigate = useNavigate();
  const [clubName, setClubName] = useState("");
  const [clubShortDescription, setClubShortDescription] = useState("");
  const [clubDescription, setClubDescription] = useState("");
  const [maxUser, setMaxUser] = useState(10);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [clubProfileImage, setClubProfileImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const handleTagAdd = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
      setFormErrors({ ...formErrors, tags: "" });
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setClubProfileImage(e.target.files[0]);
      setFormErrors({ ...formErrors, clubProfileImage: "" });
    }
  };

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!clubName.trim()) errors.clubName = "클럽 이름은 필수입니다.";
    if (!clubShortDescription.trim())
      errors.clubShortDescription = "간단한 소개는 필수입니다.";
    if (!clubDescription.trim())
      errors.clubDescription = "상세 설명은 필수입니다.";
    if (!maxUser || maxUser < 1)
      errors.maxUser = "최대 인원은 1명 이상이어야 합니다.";
    if (tags.length === 0)
      errors.tags = "최소 한 개 이상의 태그를 추가해주세요.";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const clubData: ClubCreateRequest = {
        clubName,
        clubShortDescription,
        clubDescription,
        maxUser,
        tags,
      };

      if (clubProfileImage) {
        // 이미지가 있으면 멀티파트 요청 사용
        await clubService.createClubWithImage(clubData, clubProfileImage);
      } else {
        // 이미지가 없으면 일반 JSON 요청 사용
        await clubService.createClub(clubData);
      }

      // 성공 시 클럽 상세 페이지로 이동
      navigate(`/club`);
    } catch (error) {
      console.error("클럽 생성 오류:", error);
      alert("클럽 생성 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center relative sm:w-full no-animation">
      <div className="w-full max-w-lg bg-base-100 p-4">
        <h1 className="text-2xl font-bold text-center mb-6">새 클럽 만들기</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 클럽 이름 */}
          <div className="form-control mb-4">
            <label
              htmlFor="clubName"
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
              <span className="label-text">클럽 이름</span>
            </label>
            <input
              id="clubName"
              type="text"
              value={clubName}
              onChange={(e) => {
                setClubName(e.target.value);
                setFormErrors({ ...formErrors, clubName: "" });
              }}
              className="input input-bordered placeholder:text-sm focus:input-primary"
              placeholder="클럽의 이름을 입력하세요"
              required
            />
            {formErrors.clubName && (
              <span className="text-red-500 mt-2 block">
                {formErrors.clubName}
              </span>
            )}
          </div>

          {/* 클럽 프로필 이미지 */}
          <div className="form-control mb-4">
            <label
              htmlFor="clubProfileImage"
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
                  d="M3 4a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2H3zm14 2a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1h2a1 1 0 001-1V6zM5 7a1 1 0 10-2 0v2a1 1 0
                  1002 0V7zm4.293-1.293a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414z"
                />
              </svg>
              <span className="label-text">클럽 프로필 이미지</span>
            </label>
            <input
              id="clubProfileImage"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="file-input file-input-bordered w-full placeholder:text-sm focus:file-input-primary"
            />
            {formErrors.clubProfileImage && (
              <span className="text-red-500 mt-2 block">
                {formErrors.clubProfileImage}
              </span>
            )}
          </div>

          {/* 간단한 소개 */}
          <div className="form-control mb-4">
            <label
              htmlFor="clubShortDescription"
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
              <span className="label-text">간단한 소개</span>
            </label>
            <input
              id="clubShortDescription"
              type="text"
              value={clubShortDescription}
              onChange={(e) => {
                setClubShortDescription(e.target.value);
                setFormErrors({ ...formErrors, clubShortDescription: "" });
              }}
              className="input input-bordered placeholder:text-sm focus:input-primary"
              placeholder="클럽에 대한 짧은 소개를 입력하세요"
              required
            />
            {formErrors.clubShortDescription && (
              <span className="text-red-500 mt-2 block">
                {formErrors.clubShortDescription}
              </span>
            )}
          </div>

          {/* 상세 설명 */}
          <div className="form-control mb-4">
            <label
              htmlFor="clubDescription"
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
                <path d="M3 3.5A1.5 1.5 0 014.5 2h6.879a1.5 1.5 0 011.06.44l4.122 4.12A1.5 1.5 0 0117 7.622V16.5a1.5 1.5 0 01-1.5 1.5h-11A1.5 1.5 0 013 16.5v-13z" />
                <path d="M10 3.5a.75.75 0 00.75.75h3.75v3.75a.75.75 0 001.5 0V4.5a1.5 1.5 0 00-1.5-1.5h-3.75a.75.75 0 00-.75.75z" />
              </svg>
              <span className="label-text">상세 설명</span>
            </label>
            <textarea
              id="clubDescription"
              value={clubDescription}
              onChange={(e) => {
                setClubDescription(e.target.value);
                setFormErrors({ ...formErrors, clubDescription: "" });
              }}
              className="textarea textarea-bordered focus:textarea-primary min-h-40 h-auto"
              placeholder="클럽에 대한 자세한 설명을 입력하세요"
              required
            />
            {formErrors.clubDescription && (
              <span className="text-red-500 mt-2 block">
                {formErrors.clubDescription}
              </span>
            )}
          </div>

          {/* 최대 인원 */}
          <div className="form-control mb-4">
            <label
              htmlFor="maxUser"
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
              <span className="label-text">최대 인원 (명)</span>
            </label>
            <div className="join w-full">
              <button
                type="button"
                className="btn join-item bg-gray-200"
                onClick={() => {
                  if (maxUser > 1) {
                    setMaxUser(maxUser - 1);
                    setFormErrors({ ...formErrors, maxUser: "" });
                  }
                }}
              >
                -
              </button>
              <input
                id="maxUser"
                type="number"
                value={maxUser}
                onChange={(e) => {
                  setMaxUser(Number(e.target.value));
                  setFormErrors({ ...formErrors, maxUser: "" });
                }}
                min="1"
                className="input mr-3 w-full join-item px-0 text-center focus:outline-none focus:border-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                required
              />
              <button
                type="button"
                className="btn join-item bg-gray-200"
                onClick={() => {
                  setMaxUser(maxUser + 1);
                  setFormErrors({ ...formErrors, maxUser: "" });
                }}
              >
                +
              </button>
            </div>
            {formErrors.maxUser && (
              <span className="text-red-500 mt-2 block">
                {formErrors.maxUser}
              </span>
            )}
          </div>

          {/* 태그 */}
          <div className="form-control mb-4">
            <label
              htmlFor="tagInput"
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
                  d="M4.5 2A2.5 2.5 0 0 0 2 4.5v3.879a2.5 2.5 0 0 0 .732 1.767l7.5 7.5a2.5 2.5 0 0 0 3.536 0l3.878-3.878a2.5 2.5 0 0 0 0-3.536l-7.5-7.5A2.5 2.5 0 0 0 8.38 2H4.5ZM5 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                />
              </svg>
              <span className="label-text">태그</span>
            </label>
            <div className="flex">
              <input
                id="tagInput"
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleTagAdd();
                  }
                }}
                className="flex-1 input input-bordered rounded-r-none placeholder:text-sm focus:input-primary"
                placeholder="태그 입력 후 추가"
              />
              <button
                type="button"
                onClick={handleTagAdd}
                className="btn bg-blue-500 text-white rounded-l-none hover:bg-blue-600"
              >
                추가
              </button>
            </div>

            <div className="flex flex-wrap mt-2 gap-2">
              {tags.map((tag) => (
                <div
                  key={tag}
                  className="badge badge-lg gap-1 px-3 py-3 bg-blue-100 text-blue-800"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleTagRemove(tag)}
                    className="ml-1 text-red-500"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            {formErrors.tags && (
              <span className="text-red-500 mt-2 block">{formErrors.tags}</span>
            )}
            {tags.length === 0 && (
              <span className="text-gray-500 mt-2 block text-sm">
                최소 한 개 이상의 태그를 추가해주세요.
              </span>
            )}
          </div>

          {/* 제출 버튼 */}
          <div className="form-control mt-6 mb-16">
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isLoading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  처리 중...
                </>
              ) : (
                "클럽 생성하기"
              )}
            </button>
          </div>
        </form>

        {isLoading && (
          <div className="absolute inset-0 flex flex-col justify-center items-center z-50">
            <span
              className="loading loading-spinner loading-lg"
              aria-label="Loading"
            ></span>
            <span className="mt-4">
              클럽 등록 중입니다. 잠시 기다려주세요...
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default ClubPostPage;