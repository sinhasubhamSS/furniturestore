"use client";
import { useState } from "react";
import axiosClient from "../../utils/axios";

interface SignupData {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
}
export const useSignup = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signup = async (data: SignupData) => {
    setLoading(true);
    setError(null);
    ///frontend password validation
    if (data.password !== data.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return null;
    }
    try {
      const { confirmPassword, ...signupPayload } = data;
      const res = await axiosClient.post("/user/register", signupPayload);
      console.log(res.data);
      return res.data;
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return { signup, loading, error };
};
