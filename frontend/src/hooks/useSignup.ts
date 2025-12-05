// hooks/useSignup.ts
"use client";
import { useState } from "react";
import axiosClient from "../../utils/axios";

interface SignupData {
  name: string;
  email: string;
  password: string;
  avatar?: string;
  confirmPassword?: string;
}
export const useSignup = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signup = async (data: SignupData) => {
    setLoading(true);
    setError(null);

    // frontend safety: confirmPassword check (if provided)
    if (
      data.confirmPassword !== undefined &&
      data.password !== data.confirmPassword
    ) {
      setError("Passwords do not match");
      setLoading(false);
      return null;
    }

    try {
      // Debug: log exact payload being sent
      console.log("[signup] sending payload:", data);

      const res = await axiosClient.post("/user/register", data);
      console.log("[signup] response:", res.data);
      return res.data;
    } catch (err: any) {
      // Print full server response for debugging
      console.error("[signup] error raw:", err);
      console.error("[signup] error response data:", err?.response?.data);
      const serverMsg =
        err?.response?.data?.message ||
        err?.response?.data ||
        err.message ||
        "Signup failed";
      setError(serverMsg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { signup, loading, error };
};
