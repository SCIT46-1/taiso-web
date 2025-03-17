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

  const handleTagAdd = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setClubProfileImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    <div className="flex justify-center items-center relative sm:w-full">
      <div className="w-full max-w-lg bg-base-100 p-4">
        <h1 className="text-2xl font-bold mb-6">새 클럽 만들기</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-2">클럽 이름</label>
            <input
              type="text"
              value={clubName}
              onChange={(e) => setClubName(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block mb-2">클럽 프로필 이미지</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block mb-2">간단한 소개</label>
            <div className="text-xs text-red-500 mt-2 mb-3">클럽 리스트에 보여질 간단한 한줄 소개</div>
            <input
              type="text"
              value={clubShortDescription}
              onChange={(e) => setClubShortDescription(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block mb-2">상세 설명</label>
            <div className="text-xs text-red-500 mt-2 mb-3">클럽 페이지에 보여질 우리 클럽 소개글</div>
            <textarea
              value={clubDescription}
              onChange={(e) => setClubDescription(e.target.value)}
              className="w-full p-2 border rounded h-32"
              required
            />
          </div>

          <div>
            <label className="block mb-2">최대 인원</label>
            <input
              type="number"
              value={maxUser}
              onChange={(e) => setMaxUser(Number(e.target.value))}
              min="1"
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block">태그</label>
            <div className="text-xs text-red-500 mt-2 mb-3">우리 클럽을 표현하는 태그를 자유롭게 추가해보세요!</div>
            <div className="flex">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                className="flex-1 p-2 border rounded-l"
                placeholder="태그 입력 후 추가"
              />
              <button
                type="button"
                onClick={handleTagAdd}
                className="bg-blue-500 text-white px-4 py-2 rounded-r"
              >
                추가
              </button>
            </div>

            <div className="flex flex-wrap mt-2 gap-2">
              {tags.map((tag) => (
                <div
                  key={tag}
                  className="bg-gray-200 px-3 py-1 rounded-full flex items-center"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleTagRemove(tag)}
                    className="ml-2 text-red-500"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {isLoading ? "처리 중..." : "클럽 생성하기"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ClubPostPage;
