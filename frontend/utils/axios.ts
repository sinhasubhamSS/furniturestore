// utils/axios.ts
import axios, { AxiosRequestConfig } from "axios";

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

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
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
        return new Promise((resolve, reject) =>
          failedQueue.push({ resolve, reject })
        ).then(() => axiosClient(originalRequest));
      }

      isRefreshing = true;

      try {
        const { data } = await axiosClient.post("/user/refresh-token");
        const token = data?.accessToken;

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
        // 🔥 FINAL HARD LOGOUT
        processQueue(err, null);

        if (typeof window !== "undefined") {
          document.cookie = "accessToken=; Max-Age=0; path=/";
          document.cookie = "refreshToken=; Max-Age=0; path=/";
          window.location.replace("/auth/login");
        }

        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
