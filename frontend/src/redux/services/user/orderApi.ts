import { axiosBaseQuery } from "@/redux/api/customBaseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";
import {
  Order,
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
    // Place order (COD or Razorpay)
    createOrder: builder.mutation<
      Order,
      { data: PlaceOrderRequest; idempotencyKey?: string }
    >({
      query: ({ data, idempotencyKey }) => ({
        url: `/order/placeorder/`,
        method: "POST",
        data,
        headers: idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {},
      }),
      invalidatesTags: ["Orders"],
    }),

    // Razorpay order creation
    createRazorpayOrder: builder.mutation<RazorpayOrderResponse, number>({
      query: (amount) => ({
        url: `/payment/create-order`,
        method: "POST",
        data: { amount },
      }),
      transformResponse: (response: any) => response.data,
    }),

    // ✅ NEW: Checkout pricing
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

    // Verify order amount before payment
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

    // Get user's own orders
    getMyOrders: builder.query<Order[], void>({
      query: () => ({
        url: `/order/myorders`,
        method: "GET",
      }),
      transformResponse: (response: any) => response.data,
      providesTags: ["Orders"],
    }),

    // Cancel order
    cancelOrder: builder.mutation<void, { orderId: string }>({
      query: ({ orderId }) => ({
        url: `/order/cancel-order`,
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
  useGetCheckoutPricingMutation, // ✅ NEW
  useVerifyOrderAmountMutation,
  useGetMyOrdersQuery,
  useCancelOrderMutation,
} = orderApi;
