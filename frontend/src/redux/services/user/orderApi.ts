import { axiosBaseQuery } from "@/redux/api/customBaseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";
import { Address } from "@/types/address";

// Order item structure
type OrderItem = {
  productId: string;
  quantity: number;
};

// Order placement request structure
type PlaceOrderRequest = {
  items: OrderItem[];
  shippingAddress: Address;
  payment: {
    method: "COD" | "RAZORPAY";
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
  };
  fromCart?: boolean;
};

// Razorpay order response structure
type RazorpayOrderResponse = {
  orderId: string;
  amount: number;
  currency: string;
};

export const orderApi = createApi({
  reducerPath: "orderApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Orders"],
  endpoints: (builder) => ({
    // Place order (COD or after Razorpay payment success)
    createOrder: builder.mutation<any, { data: PlaceOrderRequest }>({
      query: ({ data }) => ({
        url: `/order/placeorder/`,
        method: "POST",
        data,
      }),
      invalidatesTags: ["Orders"],
    }),

    // Create Razorpay order (gets amount, currency, orderId)
    createRazorpayOrder: builder.mutation<RazorpayOrderResponse, number>({
      query: (amount) => ({
        url: `/payment/create-order`,
        method: "POST",
        data: { amount },
      }),
      transformResponse: (response: any) => response.data, // ✅ only extract `data`
    }),
  }),
});

export const { useCreateOrderMutation, useCreateRazorpayOrderMutation } =
  orderApi;
