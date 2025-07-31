import { axiosBaseQuery } from "@/redux/api/customBaseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";
import { Address } from "@/types/address";

// Order item structure
type OrderItem = {
  productId: {
    _id: string;
    name: string;
    price: number;
    images: { url: string }[]; // ✅ Product ke image ke liye
  };
  quantity: number;
};

// Full order structure returned by backend
type Order = {
  _id: string;
  items: OrderItem[];
  shippingAddress: Address;
  payment: {
    method: "COD" | "RAZORPAY";
  };
  status: string;
  createdAt: string;
  updatedAt: string;
};

type PlaceOrderRequest = {
  items: {
    productId: string;
    quantity: number;
  }[];
  shippingAddress: Address;
  payment: {
    method: "COD" | "RAZORPAY";
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
  };
  fromCart?: boolean;
};

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
      providesTags: ["Orders"],
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useCreateRazorpayOrderMutation,
  useGetMyOrdersQuery,
} = orderApi;
