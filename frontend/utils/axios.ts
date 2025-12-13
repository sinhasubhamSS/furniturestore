// utils/axios.ts
import axios, { AxiosRequestConfig } from "axios";

const axiosClient = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

interface RetryableRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

const isAuthEndpoint = (url?: string) =>
  url?.includes("/user/login") ||
  url?.includes("/user/logout") ||
  url?.includes("/user/refresh-token");

axiosClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config as RetryableRequestConfig;

    if (!originalRequest) return Promise.reject(error);

    // 🔴 ACCESS TOKEN EXPIRED CASE
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthEndpoint(originalRequest.url)
    ) {
      console.warn("🔁 401 detected → trying refresh token");

      originalRequest._retry = true;

      // 🔒 Already refreshing → queue request
      if (isRefreshing) {
        console.log("⏳ Refresh already in progress → queue request");
        return new Promise((resolve, reject) =>
          failedQueue.push({ resolve, reject })
        ).then(() => {
          console.log("🔄 Retrying queued request:", originalRequest.url);
          return axiosClient(originalRequest);
        });
      }

      isRefreshing = true;
      console.log("🔐 Calling /user/refresh-token");

      try {
        const { data } = await axiosClient.post("/user/refresh-token");
        const token = data?.accessToken;

        console.log("✅ Refresh SUCCESS | new accessToken:", !!token);

        if (token) {
          axiosClient.defaults.headers.common.Authorization = `Bearer ${token}`;
          originalRequest.headers = {
            ...originalRequest.headers,
            Authorization: `Bearer ${token}`,
          };
        }

        processQueue(null, token ?? null);
        return axiosClient(originalRequest);
      } catch (err) {
        console.error("❌ Refresh FAILED → force logout");

        processQueue(err, null);

        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("force-logout"));
        }

        return Promise.reject(err);
      } finally {
        isRefreshing = false;
        console.log("🔓 Refresh lock released");
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
