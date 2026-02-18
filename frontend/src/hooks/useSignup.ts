"use client";
import { useState } from "react";
import axiosClient from "../../utils/axios";

interface SignupData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface VerifyOtpData {
  name: string;
  email: string;
  password: string;
  otp: string;
}

interface ApiResponse {
  success: boolean;
  message?: string;
}

export const useSignup = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ===============================
     SEND OTP
  =============================== */
  const sendOtp = async (data: SignupData): Promise<ApiResponse | null> => {
    try {
      setLoading(true);
      setError(null);

      const res = await axiosClient.post<ApiResponse>("/user/send-otp", data);

      return res.data;
    } catch (err: unknown) {
      const message =
        (err as any)?.response?.data?.message || "Failed to send OTP";
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     VERIFY OTP
  =============================== */
  const verifyOtp = async (
    data: VerifyOtpData,
  ): Promise<ApiResponse | null> => {
    try {
      setLoading(true);
      setError(null);

      const res = await axiosClient.post<ApiResponse>("/user/verify-otp", data);

      return res.data;
    } catch (err: unknown) {
      const message =
        (err as any)?.response?.data?.message || "OTP verification failed";
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { sendOtp, verifyOtp, loading, error };
};
