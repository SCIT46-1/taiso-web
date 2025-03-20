import { useEffect, useState } from "react";
import { useAuthStore } from "../stores/useAuthStore";
// 데이터 불러오기
import reviewService, { UserReviewResponse } from "../services/reviewService";
// 이미지 요청 관련

interface ReviewListProps {
  userId: number;
}

// 날짜 포멧팅
function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date
    .toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .replace(/\. /g, ".")
    .slice(0, -1); // 공백 제거
}

function ReviewList({ userId }: ReviewListProps) {
  // 리스트로 가져옴
  const [userReviews, setUserReviews] = useState<UserReviewResponse[] | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();

  console.log(isLoading, user);

  useEffect(() => {
    const fetchUserReviews = async () => {
      setIsLoading(true);
      const userReviews = await reviewService.getReviewList(Number(userId));
      setUserReviews(userReviews);
      setIsLoading(false);
    };
    fetchUserReviews();
  }, [userId]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-[80%] flex flex-col gap-2 mt-4">
      <div className="text-2xl font-bold ml-2">review</div>
      <div className="border-t border-gray-300 mb-2"></div>
      {userReviews?.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          아직 작성된 리뷰가 없습니다.
        </div>
      ) : (
        userReviews?.map((review) => (
          <div className="chat chat-start">
            <div className="chat-image avatar">
              <div className="w-10 rounded-full">
                <img
                  src={
                    review.reviewerProfileImg
                      ? `https://taiso-web-gpx-file-space-korea.s3.ap-northeast-2.amazonaws.com/${review.reviewerProfileImg}`
                      : "/userDefault.png"
                  }
                  alt={review.reviewerNickname}
                  className="size-24 bg-blue-200 -bottom-12 sm:left-14 left-6"
                />
              </div>
            </div>
            <div className="badge badge-primary mb-1 ml-3">
              {review?.reviewTag}
            </div>
            <div className="w-[100%] flex ml-2">
              <div className="chat-bubble">{review?.reviewContent}</div>
              <div>
                <span className="text-gray-500 m-1 text-xs">
                  {formatDate(review?.createdAt)}
                </span>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default ReviewList;
