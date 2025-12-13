import { axiosBaseQuery } from "@/redux/api/customBaseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";
import {
  Order,
  OrderListResponse, // ✅ Use pagination wrapper
  OrderCreationResponse,
  PlaceOrderRequest,
  RazorpayOrderResponse,
  CheckoutPricingRequest,
  CheckoutPricingResponse,
  VerifyAmountRequest,
  VerifyAmountResponse,
} from "@/types/order";

export const orderApi = createApi({
  reducerPath: "orderApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Orders"],
  endpoints: (builder) => ({
    createOrder: builder.mutation<
      OrderCreationResponse,
      { data: PlaceOrderRequest; idempotencyKey?: string }
    >({
      query: ({ data, idempotencyKey }) => ({
        url: `/order/place-order`, // ✅ Updated URL
        method: "POST",
        data,
        headers: idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {},
      }),
      transformResponse: (response: any) => {
        if (response.data) {
          return {
            success: response.success || true,
            orderId: response.data.orderId || response.data._id,
            isExisting: response.isExisting || false,
            message: response.message,
            data: response.data,
          };
        }

        return {
          success: true,
          orderId: response.orderId || response._id,
          isExisting: false,
          data: response,
        };
      },
      invalidatesTags: ["Orders"],
    }),

    createRazorpayOrder: builder.mutation<RazorpayOrderResponse, number>({
      query: (amount) => ({
        url: `/payment/create-order`,
        method: "POST",
        data: { amount },
      }),
      transformResponse: (response: any) => response.data,
    }),

    getCheckoutPricing: builder.mutation<
      CheckoutPricingResponse,
      CheckoutPricingRequest
    >({
      query: (data) => ({
        url: `/order/checkout-pricing`,
        method: "POST",
        data,
      }),
      transformResponse: (response: any) => response.data,
    }),

    verifyOrderAmount: builder.mutation<
      VerifyAmountResponse,
      VerifyAmountRequest
    >({
      query: (data) => ({
        url: `/payment/verify-amount`,
        method: "POST",
        data,
      }),
      transformResponse: (response: any) => response.data,
    }),

    // ✅ Updated with pagination support
    getMyOrders: builder.query<
      OrderListResponse, // ✅ Pagination wrapper type
      { page?: number; limit?: number } | void
    >({
      query: ({ page = 1, limit = 10 } = {}) => ({
        url: `/order/my-orders?page=${page}&limit=${limit}`, // ✅ Updated URL
        method: "GET",
      }),
      transformResponse: (response: any) => {
        // console.log("🔍 RTK Query - response.data:", response.data);
        return response.data;
      },
      providesTags: ["Orders"],
    }),

    cancelOrder: builder.mutation<void, { orderId: string }>({
      query: ({ orderId }) => ({
        url: `/order/cancel`, // ✅ Updated URL
        method: "POST",
        data: { orderId },
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: ["Orders"],
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useCreateRazorpayOrderMutation,
  useGetCheckoutPricingMutation,
  useVerifyOrderAmountMutation,
  useGetMyOrdersQuery,
  useCancelOrderMutation,
} = orderApi;
