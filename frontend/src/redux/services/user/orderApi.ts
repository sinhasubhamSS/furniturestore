import { axiosBaseQuery } from "@/redux/api/customBaseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";
import { Address } from "@/types/address";

type OrderItem = {
  productId: string;
  quantity: number;
};

type PlaceOrderRequest = {
  items: OrderItem[];
  shippingAddress: Address;
  payment: {
    method: "COD" | "RAZORPAY";
    razorpayOrderId?: string;
  };
};

export const orderApi = createApi({
  reducerPath: "orderApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Orders"],
  endpoints: (builder) => ({
    createOrder: builder.mutation<
      any,
      { userId: string; data: PlaceOrderRequest }
    >({
      query: ({ data }) => ({
        url: `/order/placeorder/`,
        method: "POST",
        data,
      }),
      invalidatesTags: ["Orders"],
    }),
    createRazorpayOrder: builder.mutation<any, number>({
      query: (amount) => ({
        url: `/payment/create-order`,
        method: "POST",
        data: { amount },
      }),
    }),
  }),
});

export const { useCreateOrderMutation, useCreateRazorpayOrderMutation } =
  orderApi;
