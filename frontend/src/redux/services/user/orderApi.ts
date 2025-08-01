import { axiosBaseQuery } from "@/redux/api/customBaseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";
import { Order, PlaceOrderRequest, RazorpayOrderResponse } from "@/types/order";

export const orderApi = createApi({
  reducerPath: "orderApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Orders"],
  endpoints: (builder) => ({
    // Place order (COD or Razorpay)
    createOrder: builder.mutation<any, { data: PlaceOrderRequest }>({
      query: ({ data }) => ({
        url: `/order/placeorder/`,
        method: "POST",
        data,
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

    // ✅ Get user's own orders
    getMyOrders: builder.query<Order[], void>({
      query: () => ({
        url: `/order/myorders`,
        method: "GET",
      }),
      transformResponse: (response: any) => response.data,
      providesTags: ["Orders"],
    }),
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
  useGetMyOrdersQuery,
  useCancelOrderMutation,
} = orderApi;
