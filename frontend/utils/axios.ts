// frontend/utils/axios.ts
import axios from "axios";

const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL, // adjust as needed
  withCredentials: true, // for cookies (if needed)
  headers: {
    "Content-Type": "application/json", // 👈 common for all requests
  },
});

export default axiosClient;
