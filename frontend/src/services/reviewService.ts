import { get } from "../api/request";

export interface UserReviewResponse {
    reviewId: number;
    reviewed: number;
    reviewer: number;
    reviewedNickname: string;
    reviewerNickname: string;
    reviewerProfileImg: string;
    reviewContent: string;
    reviewTag: string;

    createdAt: string;
    updatedAt: string;
    lightningId: number;
}

// 받은 리뷰 리스트 조회
const getReviewList = async (
    userId: number
): Promise<UserReviewResponse[]> => {
    return await get(`/users/${userId}/review`);
};

export default {
    getReviewList,
}