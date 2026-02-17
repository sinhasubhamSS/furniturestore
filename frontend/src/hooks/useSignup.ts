"use client";
import { useState } from "react";
import axiosClient from "../../utils/axios";

interface SignupData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export const useSignup = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendOtp = async (data: SignupData) => {
    setLoading(true);
    setError(null);

    try {
      const res = await axiosClient.post("/user/send-otp", data);
      return res.data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to send OTP";
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (data: {
    name: string;
    email: string;
    password: string;
    otp: string;
  }) => {
    setLoading(true);
    setError(null);

    try {
      const res = await axiosClient.post("/user/verify-otp", data);
      return res.data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || "OTP verification failed";
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { sendOtp, verifyOtp, loading, error };
};
