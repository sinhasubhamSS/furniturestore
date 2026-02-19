// utils/axios.ts
import axios, { AxiosRequestConfig } from "axios";
import { store } from "@/redux/store";
import { clearActiveUser, openLoginModal } from "@/redux/slices/userSlice";

const axiosClient = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

interface RetryableRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve()));
  failedQueue = [];
};

const isAuthEndpoint = (url?: string) =>
  url?.includes("/user/login") ||
  url?.includes("/user/register") ||
  url?.includes("/user/logout") ||
  url?.includes("/user/refresh-token");

axiosClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config as RetryableRequestConfig;

    if (!originalRequest) return Promise.reject(error);

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthEndpoint(originalRequest.url)
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => axiosClient(originalRequest));
      }

      isRefreshing = true;

      try {
        // 🔄 Try refresh silently
        await axiosClient.post("/user/refresh-token");

        processQueue(null);

        return axiosClient(originalRequest);
      } catch (err) {
        processQueue(err);

        // 🔥 FINAL SOFT LOGOUT (NO REDIRECT)
        if (typeof window !== "undefined") {
          store.dispatch(clearActiveUser());
          store.dispatch(openLoginModal());
        }

        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default axiosClient;
