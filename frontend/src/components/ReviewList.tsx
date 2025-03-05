import { useEffect, useState } from "react";
import { useAuthStore } from "../stores/useAuthStore";
// 데이터 불러오기
import reviewService, { UserReviewResponse } from "../services/reviewService";
// 이미지 요청 관련
import ImageWithSkeleton from "./ImageWithSkeleton";

interface ReviewListProps { userId: number; }

// 날짜 포멧팅
function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).replace(/\. /g, ".").slice(0, -1); // 공백 제거
}

function ReviewList({ userId }: ReviewListProps) {
    // 리스트로 가져옴
    const [userReviews, setUserReviews] = useState<UserReviewResponse[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuthStore();

    console.log(isLoading, user);

    useEffect(() => {
        const fetchUserReviews = async () => {
            setIsLoading(true);
            const userReviews = await reviewService.getReviewList(
                Number(userId)
            );
            setUserReviews(userReviews);
            setIsLoading(false);
        };
        fetchUserReviews();
    }, [userId]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="flex flex-col gap-2 mt-4 sm:ml-12 ml-4">
            {/* 리뷰를 하나씩 꺼내서 출력 */}
            {userReviews?.map((review) => ( 
                <div className="chat chat-start">
                    <div className="chat-image avatar">
                        <div className="w-10 rounded-full">
                            <ImageWithSkeleton
                                src={review.reviewerProfileImg}
                                alt={review.reviewerNickname}
                            />
                        </div>
                    </div>
                    <div className="badge badge-primary">
                        {review?.reviewTag}
                    </div>
                    <div>
                        <div className="chat-bubble">
                            {review?.reviewContent}
                        </div>
                        <div>
                            <span>{formatDate(review?.createdAt)}</span>
                        </div>
                    </div>
                </div>
            ))}   
      </div >
    );
}

export default ReviewList;









