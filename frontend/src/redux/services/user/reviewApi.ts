// api/reviewsApi.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "@/redux/api/customBaseQuery";
import { CreateReviewInput } from "@/lib/validations/review.schema";
import { ReviewsResponse, ReviewDisplayType } from "@/types/review";

export const reviewsApi = createApi({
  reducerPath: "reviewsApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Review", "ProductReviews"],
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
      invalidatesTags: ["Review", "ProductReviews"],
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
        console.log("📥 Query params:", { productId, page, limit, sortBy, sortOrder, rating });
        
        return {
          url,
          method: "GET",
        };
      },
      transformResponse: (response: any) => {
        console.log("✅ Get reviews SUCCESS response:", response);
        console.log("✅ Reviews count:", response?.reviews?.length || 0);
        console.log("✅ Pagination info:", response?.pagination);
        return response.data;
      },
      transformErrorResponse: (errorResponse: any) => {
        console.log("❌ Get reviews ERROR response:", errorResponse);
        return errorResponse;
      },
      providesTags: (result, error, { productId }) => {
        console.log("🏷️ Providing tags for productId:", productId);
        return [{ type: "ProductReviews", id: productId }];
      },
    }),
  }),
});

export const { useCreateReviewMutation, useGetProductReviewsQuery } = reviewsApi;
