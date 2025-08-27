// src/redux/api/deliveryApi.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "@/redux/api/customBaseQuery";

// Simple response type (cart jaisa)
interface DeliveryResponse {
  success: boolean;
  data: any;
  message?: string;
}

export const deliveryApi = createApi({
  reducerPath: "deliveryApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Delivery"],
  endpoints: (builder) => ({
    
    // ✅ Check pincode
    checkDelivery: builder.mutation<DeliveryResponse, { pincode: string }>({
      query: ({ pincode }) => ({
        url: `/delivery/check`,
        method: "POST",
        data: { pincode },
      }),
    }),

    // ✅ Calculate delivery cost
    calculateDeliveryCost: builder.mutation<
      DeliveryResponse,
      { pincode: string; weight: number; orderValue?: number }
    >({
      query: ({ pincode, weight, orderValue }) => ({
        url: `/delivery/calculate`,
        method: "POST",
        data: { pincode, weight, orderValue },
      }),
    }),

    // ✅ Get serviceable zones
    getServiceableZones: builder.query<DeliveryResponse, void>({
      query: () => ({
        url: `/delivery/zones`,
        method: "GET",
      }),
      transformResponse: (response: any) => response.data,
      providesTags: ["Delivery"],
    }),

  }),
});

export const {
  useCheckDeliveryMutation,
  useCalculateDeliveryCostMutation,
  useGetServiceableZonesQuery,
} = deliveryApi;
