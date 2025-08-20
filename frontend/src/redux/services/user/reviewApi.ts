// api/reviewsApi.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "@/redux/api/customBaseQuery";
import {
  CreateReviewInput,
  UpdateReviewInput,
} from "@/lib/validations/review.schema";
import { ReviewsResponse, ReviewDisplayType } from "@/types/review";

export const reviewsApi = createApi({
  reducerPath: "reviewsApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Review", "ProductReviews", "UserReviews"],
  endpoints: (builder) => ({
    // ✅ Create Review
    createReview: builder.mutation<
      { success: boolean; message: string; review: ReviewDisplayType },
      CreateReviewInput
    >({
      query: (data) => {
        console.log("📤 Creating review with data:", data);
        return {
          url: `/products/${data.productId}/createreview`,
          method: "POST",
          data,
        };
      },
      transformResponse: (response: any) => {
        console.log("✅ Create review response:", response);
        return response;
      },
      transformErrorResponse: (errorResponse: any) => {
        console.log("❌ Create review error:", errorResponse);
        return errorResponse;
      },
      invalidatesTags: (result, error, arg) => [
        "Review",
        { type: "ProductReviews", id: arg.productId },
        "UserReviews",
      ],
    }),

    // ✅ Update Review
    updateReview: builder.mutation<
      { success: boolean; message: string; review: ReviewDisplayType },
      UpdateReviewInput & { reviewId: string }
    >({
      query: ({ reviewId, ...data }) => {
        console.log("📝 Updating review:", reviewId, data);
        return {
          url: `/reviews/${reviewId}`,
          method: "PUT",
          data,
        };
      },
      transformResponse: (response: any) => {
        console.log("✅ Update review response:", response);
        return response;
      },
      transformErrorResponse: (errorResponse: any) => {
        console.log("❌ Update review error:", errorResponse);
        return errorResponse;
      },
      invalidatesTags: (result, error, arg) => [
        "Review",
        { type: "Review", id: arg.reviewId },
        "ProductReviews",
        "UserReviews",
      ],
    }),

    // ✅ Delete Review
    deleteReview: builder.mutation<
      { success: boolean; message: string },
      { reviewId: string }
    >({
      query: ({ reviewId }) => {
        console.log("🗑️ Deleting review:", reviewId);
        return {
          url: `/reviews/${reviewId}`,
          method: "DELETE",
        };
      },
      transformResponse: (response: any) => {
        console.log("✅ Delete review response:", response);
        return response;
      },
      transformErrorResponse: (errorResponse: any) => {
        console.log("❌ Delete review error:", errorResponse);
        return errorResponse;
      },
      invalidatesTags: (result, error, arg) => [
        "Review",
        { type: "Review", id: arg.reviewId },
        "ProductReviews",
        "UserReviews",
      ],
    }),

    // ✅ Get Single Review by ID
    getReviewById: builder.query<
      { success: boolean; review: ReviewDisplayType },
      string
    >({
      query: (reviewId) => {
        console.log("📖 Fetching review by ID:", reviewId);
        return {
          url: `/reviews/${reviewId}`,
          method: "GET",
        };
      },
      transformResponse: (response: any) => {
        console.log("✅ Get review by ID response:", response);
        return response;
      },
      providesTags: (result, error, reviewId) => [
        { type: "Review", id: reviewId },
      ],
    }),

    // ✅ Get Product Reviews - Using existing types
    getProductReviews: builder.query<
      ReviewsResponse,
      {
        productId: string;
        page?: number;
        limit?: number;
        sortBy?: "createdAt" | "rating" | "helpfulVotes";
        sortOrder?: "asc" | "desc";
        rating?: number;
      }
    >({
      query: ({
        productId,
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "desc",
        rating,
      }) => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          sortBy,
          sortOrder,
        });
        if (rating) params.append("rating", rating.toString());

        const url = `/products/${productId}/reviews?${params}`;
        console.log("📥 Fetching reviews from URL:", url);
        console.log("📥 Query params:", {
          productId,
          page,
          limit,
          sortBy,
          sortOrder,
          rating,
        });

        return {
          url,
          method: "GET",
        };
      },
      transformResponse: (response: any) => {
        console.log("✅ Get reviews SUCCESS response:", response);
        console.log("✅ Reviews count:", response?.reviews?.length || 0);
        console.log("✅ Pagination info:", response?.pagination);
        return response.data; // Remove .data since backend returns direct object
      },
      transformErrorResponse: (errorResponse: any) => {
        console.log("❌ Get reviews ERROR response:", errorResponse);
        return errorResponse;
      },
      providesTags: (result, error, { productId }) => {
        console.log("🏷️ Providing tags for productId:", productId);
        return [
          { type: "ProductReviews", id: productId },
          ...(result?.reviews?.map((review) => ({
            type: "Review" as const,
            id: review._id,
          })) || []),
        ];
      },
    }),

    // ✅ Get User Reviews (Bonus)
    getUserReviews: builder.query<
      ReviewsResponse,
      {
        page?: number;
        limit?: number;
        sortBy?: "createdAt" | "rating" | "helpfulVotes";
        sortOrder?: "asc" | "desc";
      }
    >({
      query: ({
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "desc",
      }) => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          sortBy,
          sortOrder,
        });

        const url = `/users/reviews?${params}`;
        console.log("👤 Fetching user reviews from URL:", url);

        return {
          url,
          method: "GET",
        };
      },
      transformResponse: (response: any) => {
        console.log("✅ Get user reviews response:", response);
        return response;
      },
      providesTags: (result) => [
        "UserReviews",
        ...(result?.reviews?.map((review) => ({
          type: "Review" as const,
          id: review._id,
        })) || []),
      ],
    }),
  }),
});

export const {
  useCreateReviewMutation,
  useGetProductReviewsQuery,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
  useGetReviewByIdQuery,
  useGetUserReviewsQuery,
} = reviewsApi;
