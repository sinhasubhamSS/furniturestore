import { axiosBaseQuery } from "@/redux/api/customBaseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";
import {
  Order,
  OrderCreationResponse, // ✅ Import this
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
    // ✅ FIXED: Return OrderCreationResponse instead of Order
    createOrder: builder.mutation<
      OrderCreationResponse, // ✅ Changed from Order to OrderCreationResponse
      { data: PlaceOrderRequest; idempotencyKey?: string }
    >({
      query: ({ data, idempotencyKey }) => ({
        url: `/order/placeorder/`,
        method: "POST",
        data,
        headers: idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {},
      }),
      // ✅ FIXED: Transform response to match OrderCreationResponse
      transformResponse: (response: any) => {
        // Assuming your backend returns something like:
        // { success: true, message: "Order created", data: orderObject }
        // Or { success: true, orderId: "123", isExisting: false, data: orderObject }
        
        if (response.data) {
          // If backend returns { success, data, message } format
          return {
            success: response.success || true,
            orderId: response.data.orderId || response.data._id,
            isExisting: response.isExisting || false,
            message: response.message,
            data: response.data
          };
        }
        
        // If backend returns direct order data, wrap it
        return {
          success: true,
          orderId: response.orderId || response._id,
          isExisting: false,
          data: response
        };
      },
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

    // Checkout pricing
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
  useGetCheckoutPricingMutation,
  useVerifyOrderAmountMutation,
  useGetMyOrdersQuery,
  useCancelOrderMutation,
} = orderApi;
