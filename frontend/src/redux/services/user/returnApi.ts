import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "@/redux/api/customBaseQuery";

// ✅ Import proper types
import {
  Return,
  CreateReturnRequest,
  ApiResponse,
  ReturnEligibilityResponse,
  ReturnListResponse,
  CreateReturnResponse,
} from "@/types/return";

// ✅ Define API argument types
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
    // ✅ 1. Check eligibility for order return - Properly typed
    checkEligibility: builder.query<
      ApiResponse<ReturnEligibilityResponse>,
      CheckEligibilityArgs
    >({
      query: ({ orderId }) => ({
        url: `/returns/eligibility/${orderId}`,
        method: "GET",
      }),
      providesTags: ["Return"],
      transformResponse: (response: any) => {
        return response; // Backend already sends correct format
      },
    }),

    // ✅ 2. Create return request - Properly typed
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
      transformResponse: (response: any) => {
        return response;
      },
    }),

    // ✅ 3. Get user's returns with pagination - Properly typed
    getUserReturns: builder.query<
      ApiResponse<ReturnListResponse>,
      GetUserReturnsArgs | void
    >({
      query: ({ page = 1, limit = 10 } = {}) => ({
        url: `/returns/user?page=${page}&limit=${limit}`,
        method: "GET",
      }),
      providesTags: ["Return"],
      transformResponse: (response: any) => {
        return response;
      },
    }),

    // ✅ 4. Get specific return by ID - Properly typed
    getReturnById: builder.query<
      ApiResponse<{ return: Return }>,
      GetReturnByIdArgs
    >({
      query: ({ returnId }) => ({
        url: `/returns/${returnId}`,
        method: "GET",
      }),
      providesTags: ["Return"],
      transformResponse: (response: any) => {
        return response;
      },
    }),

    // ✅ 5. Cancel return request - Properly typed
    cancelReturn: builder.mutation<ApiResponse<{}>, GetReturnByIdArgs>({
      query: ({ returnId }) => ({
        url: `/returns/${returnId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Return", "Order"],
      transformResponse: (response: any) => {
        return response;
      },
    }),

    // ✅ 6. Get all returns (Admin) - Properly typed
    getAllReturns: builder.query<
      ApiResponse<ReturnListResponse>,
      GetUserReturnsArgs | void
    >({
      query: ({ page = 1, limit = 10 } = {}) => ({
        url: `/returns/admin/all?page=${page}&limit=${limit}`,
        method: "GET",
      }),
      providesTags: ["Return"],
      transformResponse: (response: any) => {
        return response;
      },
    }),

    // ✅ 7. Update return status (Admin) - Properly typed
    updateReturnStatus: builder.mutation<
      ApiResponse<{ return: Return }>,
      { returnId: string; status: string; adminNotes?: string }
    >({
      query: ({ returnId, status, adminNotes }) => ({
        url: `/returns/${returnId}`,
        method: "PUT",
        data: { status, adminNotes },
      }),
      invalidatesTags: ["Return"],
      transformResponse: (response: any) => {
        return response;
      },
    }),
  }),
});

// ✅ Export typed hooks - Auto-completion and type safety
export const {
  useCheckEligibilityQuery,
  useCreateReturnMutation,
  useGetUserReturnsQuery,
  useGetReturnByIdQuery,
  useCancelReturnMutation,
  useGetAllReturnsQuery,
  useUpdateReturnStatusMutation,
} = returnApi;

// ✅ Export API for store configuration
export default returnApi;
