// hooks/useLogin.ts
"use client";

import { useState } from "react";
import axiosClient from "../../utils/axios";
import { useDispatch } from "react-redux";
import { setActiveUser } from "@/redux/slices/userSlice";

interface LoginData {
  email: string;
  password: string;
}

export const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch();
  const login = async (data: LoginData) => {
    setLoading(true);
    setError(null);


    try {
      const res = await axiosClient.post("/user/login", data);
      console.log("Login success:", res.data);
      dispatch(setActiveUser(res.data.user))
      return res.data;

    } catch (err: any) {
      console.error("Login error:", err);
      setError(err?.response?.data?.message || "Login failed");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
};
