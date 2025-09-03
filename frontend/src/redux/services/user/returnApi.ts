import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "@/redux/api/customBaseQuery";

// ✅ Use your existing return types - no changes needed!
import {
  Return,
  CreateReturnRequest,
  ApiResponse,
  ReturnEligibilityResponse,
  ReturnListResponse,
  CreateReturnResponse,
} from "@/types/return";

interface CheckEligibilityArgs {
  orderId: string;
}

interface GetReturnByIdArgs {
  returnId: string;
}

interface GetUserReturnsArgs {
  page?: number;
  limit?: number;
}

export const returnApi = createApi({
  reducerPath: "returnApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Return", "Order"],
  endpoints: (builder) => ({
    checkEligibility: builder.query<
      ApiResponse<ReturnEligibilityResponse>,
      CheckEligibilityArgs
    >({
      query: ({ orderId }) => ({
        url: `/returns/eligibility/${orderId}`,
        method: "GET",
      }),
      providesTags: ["Return"],
    }),

    createReturn: builder.mutation<
      ApiResponse<CreateReturnResponse>,
      CreateReturnRequest
    >({
      query: ({ orderId, returnItems, returnReason }) => ({
        url: `/returns`,
        method: "POST",
        data: { orderId, returnItems, returnReason },
      }),
      invalidatesTags: ["Return", "Order"],
    }),

    getUserReturns: builder.query<
      ApiResponse<ReturnListResponse>,
      GetUserReturnsArgs | void
    >({
      query: ({ page = 1, limit = 10 } = {}) => ({
        url: `/returns/my-returns?page=${page}&limit=${limit}`, // ✅ Updated URL
        method: "GET",
      }),
      providesTags: ["Return"],
    }),

    getReturnById: builder.query<
      ApiResponse<{ return: Return }>,
      GetReturnByIdArgs
    >({
      query: ({ returnId }) => ({
        url: `/returns/${returnId}`,
        method: "GET",
      }),
      providesTags: ["Return"],
    }),

    cancelReturn: builder.mutation<ApiResponse<{}>, GetReturnByIdArgs>({
      query: ({ returnId }) => ({
        url: `/returns/${returnId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Return", "Order"],
    }),

    getAllReturns: builder.query<
      ApiResponse<ReturnListResponse>,
      GetUserReturnsArgs | void
    >({
      query: ({ page = 1, limit = 10 } = {}) => ({
        url: `/returns/admin/all?page=${page}&limit=${limit}`,
        method: "GET",
      }),
      providesTags: ["Return"],
    }),

    updateReturnStatus: builder.mutation<
      ApiResponse<{ return: Return }>,
      { returnId: string; status: string; adminNotes?: string }
    >({
      query: ({ returnId, status, adminNotes }) => ({
        url: `/returns/${returnId}/status`, // ✅ Updated URL
        method: "PUT",
        data: { status, adminNotes },
      }),
      invalidatesTags: ["Return"],
    }),

    getNextAllowedStatuses: builder.query<
      ApiResponse<{ currentStatus: string; nextAllowedStatuses: string[] }>,
      GetReturnByIdArgs
    >({
      query: ({ returnId }) => ({
        url: `/returns/${returnId}/next-statuses`, // ✅ New endpoint
        method: "GET",
      }),
      providesTags: ["Return"],
    }),
  }),
});

export const {
  useCheckEligibilityQuery,
  useCreateReturnMutation,
  useGetUserReturnsQuery,
  useGetReturnByIdQuery,
  useCancelReturnMutation,
  useGetAllReturnsQuery,
  useUpdateReturnStatusMutation,
  useGetNextAllowedStatusesQuery, // ✅ New hook
} = returnApi;

export default returnApi;
