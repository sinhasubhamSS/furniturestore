// types/reviewTypes.ts
import {
  ReviewImageType,
  ReviewVideoType,
} from "../lib/validations/review.schema";

export interface ReviewDisplayType {
  _id: string;
  rating: number;
  content?: string;
  userId: {
    _id: string;
    name: string;
    avatar?: string;
  };
  productId: string;
  createdAt: string;
  helpfulVotes: number;
  isVerifiedPurchase: boolean;
  images?: ReviewImageType[]; // ✅ Correct - Type import
  videos?: ReviewVideoType[]; // ✅ Correct - Type import
}

export interface ReviewsResponse {
  success: boolean;
  reviews: ReviewDisplayType[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalReviews: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
