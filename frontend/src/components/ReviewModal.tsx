import { useEffect, useState } from "react";
import { MyLightningResponse } from "../services/userDetailService";
import lightningService from "../services/lightningService";
import { UserReviewData } from "../services/lightningService";
import GlobalModal from "./GlobalModal";

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

  // 모달 초기화 함수
  const resetModal = () => {
    setReviewText("");
    setSelectedTag("EXCELLENT");
    setSelectedUser(null);
    setModalState("review");
  };

  // 모든 리뷰가 완료되었는지 확인하는 함수
  const checkAllReviewsCompleted = (data: UserReviewData[]) => {
    const completed = data.length > 0 && data.every((user) => user.isReviewed);
    setAllReviewsCompleted(completed);
    return completed;
  };

  const fetchReviewData = async () => {
    try {
      setIsLoading(true);
      const data = await lightningService.getLightningReview(
        lightning.lightning.lightningId
      );
      setReviewData(data || []);
      setIsLoading(false);
      resetModal();

      // 리뷰 데이터를 가져온 후 모든 리뷰가 완료되었는지 확인
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

      // API call with the actual endpoint
      await lightningService.submitUserReview(
        lightning.lightning.lightningId,
        selectedUser.userDetailDTO.userId,
        {
          reviewContent: reviewText,
          reviewTag: selectedTag,
        }
      );

      // 주의: 여기서 fetchReviewData를 호출하되, resetModal은 호출하지 않습니다.
      // 선택된 사용자 정보를 유지하기 위해서입니다.
      await fetchReviewData();

      // 리뷰 완료 후 텍스트 필드만 초기화
      setReviewText("");
      setModalState("success");
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to submit review:", error);
      setIsLoading(false);
    }
  };

  // 리뷰 삭제 처리 함수
  const handleDeleteReview = async () => {
    if (!selectedUser) return;

    try {
      setIsLoading(true);

      await lightningService.deleteUserReview(
        lightning.lightning.lightningId,
        selectedUser.userDetailDTO.userId
      );

      // 삭제 후 데이터 갱신 및 상태 확인
      const updatedData = await lightningService.getLightningReview(
        lightning.lightning.lightningId
      );
      setReviewData(updatedData || []);
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
      setTimeout(resetModal, 300); // 모달 닫힘 애니메이션이 끝난 후 상태 초기화
    }
  };

  useEffect(() => {
    const modal = document.getElementById(modalId) as HTMLDialogElement;

    // Observer to detect when modal is shown
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
  }, [modalId]);

  // 모달 내용 렌더링 함수

  const renderModalContent = () => {
    if (modalState === "success") {
      <GlobalModal
        id="review-success-modal"
        imgType="success"
        title="리뷰 등록 완료"
        actions={
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
              리뷰 등록으로 돌아가기
            </button>
          </div>
        }
      >
        <p className="text-center mb-2">리뷰가 성공적으로 등록되었습니다.</p>
        <p className="text-sm text-gray-500 mb-6">
          선택하신 평가:{" "}
          {
            reviewTagOptions.find((option) => option.value === selectedTag)
              ?.label
          }
        </p>
      </GlobalModal>
    }

    if (modalState === "delete-confirm") {
      <GlobalModal
        id="delete-confirm"
        imgType="warning"
        title="리뷰 삭제 확인"
        actions={
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
        }
      >
        <p className="text-center mb-6">
          {selectedUser?.userDetailDTO.reviewedNickname}님에 대한 리뷰를
          삭제하시겠습니까?
        </p>
      </GlobalModal>
    }

    if (modalState === "delete-success") {
      <GlobalModal
        id="review-delete-success-modal"
        imgType="success"
        title="리뷰 삭제 완료"
        actions={
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
              리뷰 등록으로 돌아가기
            </button>
          </div>
        }
      >
        <p className="text-center mb-6">리뷰가 성공적으로 삭제되었습니다.</p>
      </GlobalModal>
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
                  <span className="text-primary font-semibold">{lightning.lightning.title}</span>
                  에 참여한 유저에 대한 리뷰를 남겨주세요
                </h4>
                <div className="divider w-full -my-2 -mb-1"></div>


                {/* 모든 리뷰 완료 시 메시지 표시 */}
                <div>
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

                {/* User selection */}
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
                          // 이미 리뷰된 상태면 작성 폼을 비활성화
                          if (user.isReviewed) {
                            setReviewText("");
                          }
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {user.userDetailDTO.reviewedProfileImg ? (
                              <img
                                src={user.userDetailDTO.reviewedProfileImg}
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
                            {/* 이미 리뷰가 있는 경우 표시 */}
                            {user.isReviewed && (
                              <span className="badge badge-sm badge-primary py-3">작성완료</span>
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
                      // 이미 리뷰가 작성된 경우 삭제 버튼 표시
                        <div className="mt-4 flex justify-center w-full px-5">
                        <button
                          className="btn btn-error btn-sm no-animation w-full"
                          onClick={() => setModalState("delete-confirm")}
                        >
                          작성한 리뷰 삭제하기
                        </button>
                      </div>
                    ) : (
                      // 새 리뷰 작성 폼
                      <>
                        {/* Review Tag/Rating Selection */}
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

                        {/* Review Text */}
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
          <button className="btn btn-sm no-animation flex items-center justify-center h-10" onClick={handleClose}>
            닫기
          </button>

        </div>
      </>
    );
  };

  return (
    <dialog id={modalId} className="modal">
      <div className="modal-box relative max-w-3xl p-10">{renderModalContent()}</div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={resetModal}>close</button>
      </form>
    </dialog>
  );
}

export default ReviewModal;
