"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axiosClient from "../../../../utils/axios";

const VerifyEmailPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [message, setMessage] = useState("Verifying...");

  useEffect(() => {
    if (!token) return;

    const verify = async () => {
      try {
        await axiosClient.get(`/user/verify-email?token=${token}`);
        setMessage("Email verified successfully 🎉 Redirecting...");
        setTimeout(() => {
          router.push("/auth/login");
        }, 2000);
      } catch (err: any) {
        setMessage(err?.response?.data?.message || "Verification failed");
      }
    };

    verify();
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center text-center">
      <h2 className="text-xl font-semibold">{message}</h2>
    </div>
  );
};

export default VerifyEmailPage;
