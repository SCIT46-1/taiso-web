import { useEffect, useState } from "react";
import { MyLightningResponse } from "../services/userDetailService";
import lightningService from "../services/lightningService";
import { UserReviewData } from "../services/lightningService";

interface ReviewModalProps {
  lightning: MyLightningResponse;
  modalId: string;
}

// Define review tag options
type ReviewTag = "EXCELLENT" | "GOOD" | "AVERAGE" | "POOR";

const reviewTagOptions: { value: ReviewTag; label: string }[] = [
  { value: "EXCELLENT", label: "매우 좋음" },
  { value: "GOOD", label: "좋음" },
  { value: "AVERAGE", label: "보통" },
  { value: "POOR", label: "나쁨" },
];

// 모달 상태를 정의하는 타입
type ModalState = "review" | "success" | "delete-confirm" | "delete-success";

function ReviewModal({ lightning, modalId }: ReviewModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [reviewData, setReviewData] = useState<UserReviewData[]>([]);
  const [reviewText, setReviewText] = useState("");
  const [selectedTag, setSelectedTag] = useState<ReviewTag>("EXCELLENT");
  const [selectedUser, setSelectedUser] = useState<UserReviewData | null>(null);
  const [modalState, setModalState] = useState<ModalState>("review");
  const [allReviewsCompleted, setAllReviewsCompleted] = useState(false);

  // 리뷰 입력폼만 초기화 (selectedUser는 유지)
  const resetReviewForm = () => {
    setReviewText("");
    setSelectedTag("EXCELLENT");
  };

  // 전체 모달 초기화 (selectedUser 포함)
  const resetModal = () => {
    resetReviewForm();
    setSelectedUser(null);
    setModalState("review");
  };

  const checkAllReviewsCompleted = (data: UserReviewData[]) => {
    const completed = data.length > 0 && data.every((user) => user.isReviewed);
    setAllReviewsCompleted(completed);
    return completed;
  };

  // 모달이 열릴 때 리뷰 데이터를 가져오는데,
  // modalState가 "review"인 경우 전체 초기화, 그 외엔 입력폼만 초기화하여 selectedUser를 보존합니다.
  const fetchReviewData = async () => {
    try {
      setIsLoading(true);
      const data = await lightningService.getLightningReview(
        lightning.lightning.lightningId
      );
      setReviewData(data || []);
      setIsLoading(false);

      if (modalState === "review") {
        resetModal();
      } else {
        resetReviewForm();
      }
      checkAllReviewsCompleted(data || []);
    } catch (error) {
      console.error("Failed to fetch review data:", error);
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!reviewText || !selectedUser) {
      alert("리뷰 내용과 리뷰 대상자를 모두 입력해주세요");
      return;
    }

    try {
      setIsLoading(true);

      await lightningService.submitUserReview(
        lightning.lightning.lightningId,
        selectedUser.userDetailDTO.userId,
        {
          reviewContent: reviewText,
          reviewTag: selectedTag,
        }
      );

      // 리뷰 제출 후 데이터 갱신 (이때는 입력폼만 초기화하여 selectedUser는 그대로 유지)
      await fetchReviewData();

      setReviewText("");
      setModalState("success");
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to submit review:", error);
      setIsLoading(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!selectedUser) return;

    try {
      setIsLoading(true);

      await lightningService.deleteUserReview(
        lightning.lightning.lightningId,
        selectedUser.userDetailDTO.userId
      );

      const updatedData = await lightningService.getLightningReview(
        lightning.lightning.lightningId
      );
      setReviewData(updatedData || []);

      // 업데이트 된 데이터에서 선택된 유저를 찾아서 업데이트
      if (selectedUser) {
        const updatedSelectedUser =
          updatedData?.find(
            (user) =>
              user.userDetailDTO.userId === selectedUser.userDetailDTO.userId
          ) || null;
        setSelectedUser(updatedSelectedUser);
      }

      checkAllReviewsCompleted(updatedData || []);

      setModalState("delete-success");
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to delete review:", error);
      setIsLoading(false);
      alert("리뷰 삭제 중 오류가 발생했습니다.");
    }
  };

  const handleClose = () => {
    const modal = document.getElementById(modalId) as HTMLDialogElement;
    if (modal) {
      modal.close();
      setTimeout(resetModal, 300); // 모달 닫힘 애니메이션 후 전체 초기화
    }
  };

  useEffect(() => {
    const modal = document.getElementById(modalId) as HTMLDialogElement;

    // 모달의 open 속성 변경을 감지하여 리뷰 데이터를 갱신합니다.
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "open" && modal.hasAttribute("open")) {
          fetchReviewData();
        }
      });
    });

    if (modal) {
      observer.observe(modal, { attributes: true });
    }

    return () => {
      observer.disconnect();
    };
  }, [modalId, modalState]);

  // 모달 내용 렌더링 함수
  const renderModalContent = () => {
    if (modalState === "success") {
      return (
        <div>
          <h3 className="font-bold text-lg mb-4 text-center">리뷰 등록 완료</h3>
          <div className="flex flex-col items-center">
            <div className="mb-3">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-green-500"
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
            </div>
            <p className="text-center mb-2">
              리뷰가 성공적으로 등록되었습니다.
            </p>
            <div className="flex gap-3">
              <button
                className="btn btn-primary btn-sm no-animation"
                onClick={handleClose}
              >
                확인
              </button>
              <button
                className="btn btn-outline btn-sm no-animation"
                onClick={() => setModalState("review")}
              >
                추가로 리뷰쓰기
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (modalState === "delete-confirm") {
      return (
        <div>
          <h3 className="font-bold text-lg mb-4 text-center">리뷰 삭제 확인</h3>
          <div className="flex flex-col items-center">
            <div className="mb-3">
              <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-yellow-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
            </div>
            <p className="text-center mb-6">
              {selectedUser?.userDetailDTO.reviewedNickname
                ? `${selectedUser.userDetailDTO.reviewedNickname}님에 대한 리뷰를 삭제하시겠습니까?`
                : "삭제할 리뷰 대상이 선택되지 않았습니다."}
            </p>
            <div className="flex gap-3">
              <button
                className="btn btn-error btn-sm no-animation"
                onClick={handleDeleteReview}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  "삭제하기"
                )}
              </button>
              <button
                className="btn btn-outline btn-sm no-animation"
                onClick={() => setModalState("review")}
                disabled={isLoading}
              >
                취소
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (modalState === "delete-success") {
      return (
        <div>
          <div className="flex flex-col items-center justify-center">
            <div className="mb-3">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-green-500"
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
            </div>
            <h3 className="font-bold text-lg mb-4 text-center">
              리뷰 삭제 완료
            </h3>
            <p className="text-center mb-6">
              리뷰가 성공적으로 삭제되었습니다.
            </p>
            <div className="flex gap-3">
              <button
                className="btn btn-primary btn-sm no-animation"
                onClick={handleClose}
              >
                확인
              </button>
              <button
                className="btn btn-outline btn-sm no-animation"
                onClick={() => setModalState("review")}
              >
                추가로 리뷰쓰기
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <>
        <h3 className="font-bold text-lg mb-4 text-center">참여자 리뷰 등록</h3>
        <div className="py-1">
          {isLoading ? (
            <div className="flex justify-center my-8">
              <span className="loading loading-spinner loading-md"></span>
            </div>
          ) : (
            <div>
              <h4 className="text-sm mb-3 text-center">
                <span className="text-primary font-semibold">
                  {lightning.lightning.title}
                </span>
                에 참여한 유저에 대한 리뷰를 남겨주세요
              </h4>
              <div className="divider w-full -my-2 -mb-1"></div>
              {allReviewsCompleted && (
                <div className="alert bg-primary my-3 p-2 text-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>모든 참여자에 대한 리뷰를 완료했습니다</span>
                </div>
              )}
              <div className="mb-5">
                <label className="block mt-3 mb-2 text-sm font-semibold px-3">
                  리뷰할 참여자 선택
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {reviewData.map((user) => (
                    <div
                      key={user.reviewed}
                      className={`border rounded-lg p-3 cursor-pointer transition-all ${
                        selectedUser?.reviewed === user.reviewed
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => {
                        setSelectedUser(user);
                        if (user.isReviewed) {
                          setReviewText("");
                        }
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {user.userDetailDTO.reviewedProfileImg ? (
                            <img
                              src={`https://taiso-web-gpx-file-space-korea.s3.ap-northeast-2.amazonaws.com/${user.userDetailDTO.reviewedProfileImg}`}
                              alt={user.userDetailDTO.reviewedNickname}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                              <span className="text-gray-500 text-sm">👤</span>
                            </div>
                          )}
                          <div>
                            <div className="font-medium">
                              {user.userDetailDTO.reviewedNickname}
                            </div>
                            <div className="text-xs text-gray-500">
                              {user.lightningUserDTO.role}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          {user.isReviewed && (
                            <span className="badge badge-sm badge-primary py-3">
                              작성완료
                            </span>
                          )}
                          {user.isReviewed && (
                            <div className="mt-2 text-xs text-blue-500">
                              이미 리뷰를 작성했습니다
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {selectedUser && (
                <>
                  {selectedUser.isReviewed ? (
                    <div className="mt-4 flex justify-center w-full px-5">
                      <button
                        className="btn btn-error btn-sm no-animation w-full"
                        onClick={() => setModalState("delete-confirm")}
                      >
                        작성한 리뷰 삭제하기
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="mb-4">
                        <label className="block mb-2 text-sm font-medium">
                          참여자 평가
                        </label>
                        <select
                          className="select select-bordered w-full"
                          value={selectedTag}
                          onChange={(e) =>
                            setSelectedTag(e.target.value as ReviewTag)
                          }
                        >
                          {reviewTagOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="mb-4">
                        <label className="block mb-2 text-sm font-medium">
                          리뷰 내용
                        </label>
                        <textarea
                          className="textarea textarea-bordered w-full"
                          placeholder={`${selectedUser.userDetailDTO.reviewedNickname}님에 대한 리뷰를 작성해주세요`}
                          rows={4}
                          value={reviewText}
                          onChange={(e) => setReviewText(e.target.value)}
                        ></textarea>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </div>
        <div className="modal-action">
          {selectedUser && !selectedUser.isReviewed && (
            <button
              className="btn btn-primary btn-sm no-animation flex items-center justify-center h-10"
              disabled={isLoading || !selectedUser || !reviewText}
              onClick={handleSubmit}
            >
              리뷰 등록
            </button>
          )}
          <button
            className="btn btn-sm no-animation flex items-center justify-center h-10"
            onClick={handleClose}
          >
            닫기
          </button>
        </div>
      </>
    );
  };

  return (
    <dialog id={modalId} className="modal">
      <div className="modal-box relative max-w-3xl p-10">
        {renderModalContent()}
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={resetModal}>close</button>
      </form>
    </dialog>
  );
}

export default ReviewModal;
