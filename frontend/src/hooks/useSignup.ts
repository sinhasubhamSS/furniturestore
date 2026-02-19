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

interface SendOtpResponse {
  success: boolean;
  message: string;
}

interface VerifyOtpResponse {
  success: boolean;
  message: string;
  userData: {
    _id: string;
    name: string;
    email: string;
    role: "buyer" | "admin";
  };
}

export const useSignup = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendOtp = async (data: SignupData): Promise<SendOtpResponse | null> => {
    try {
      setLoading(true);
      setError(null);

      const res = await axiosClient.post<SendOtpResponse>(
        "/user/send-otp",
        data,
      );

      return res.data;
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to send OTP");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (
    data: VerifyOtpData,
  ): Promise<VerifyOtpResponse | null> => {
    try {
      setLoading(true);
      setError(null);

      const res = await axiosClient.post<VerifyOtpResponse>(
        "/user/verify-otp",
        data,
      );

      return res.data;
    } catch (err: any) {
      setError(err?.response?.data?.message || "OTP verification failed");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { sendOtp, verifyOtp, loading, error };
};
