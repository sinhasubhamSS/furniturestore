import { axiosBaseQuery } from "@/redux/api/customBaseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";

export const addressApi = createApi({
  reducerPath: "addressApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Addresses"],
  endpoints: (builder) => ({
    // ✅ Get all published products
   
  }),
});

export const {  } =
  addressApi;
