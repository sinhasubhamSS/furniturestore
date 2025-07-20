import { axiosBaseQuery } from "@/redux/api/customBaseQuery";
import { Address } from "@/types/address";
import { createApi } from "@reduxjs/toolkit/query/react";

export const addressApi = createApi({
  reducerPath: "addressApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Addresses"],
  endpoints: (builder) => ({
    // ✅ Get all addresses
    getAddresses: builder.query<Address[], void>({
      query: () => ({ url: "/address", method: "GET" }),
      transformResponse: (res: { data: Address[] }) => res.data,
      providesTags: ["Addresses"],
    }),

    // ✅ Create address
    createAddress: builder.mutation<Address, Partial<Address>>({
      query: (body) => ({ url: "/address/create", method: "POST", data: body }),
      transformResponse: (res: { data: Address }) => res.data,
      invalidatesTags: ["Addresses"],
    }),

    // ✅ Update address
    updateAddress: builder.mutation<
      Address,
      { id: string; data: Partial<Address> }
    >({
      query: ({ id, data }) => ({
        url: `/address/update/${id}`,
        method: "PATCH",
        data,
      }),
      transformResponse: (res: { data: Address }) => res.data,
      invalidatesTags: ["Addresses"],
    }),

    // ✅ Delete address
    deleteAddress: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/address/delete/${id}`,
        method: "DELETE",
      }),
      transformResponse: (res: { data: { success: boolean } }) => res.data,
      invalidatesTags: ["Addresses"],
    }),
  }),
});

export const {
  useGetAddressesQuery,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
} = addressApi;
