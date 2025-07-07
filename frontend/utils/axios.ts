// frontend/utils/axios.ts
import axios from "axios";

const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// 👇 Yeh line galat thi: axiosInstance.interceptors...
// ✅ Corrected:
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = "/auth/login"; // or use router.push("/login") if inside component
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
