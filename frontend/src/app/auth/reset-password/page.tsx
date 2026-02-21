"use client";

import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import Input from "@/components/ui/Input";
import { useState } from "react";

type ResetForm = {
  otp: string;
  newPassword: string;
};

const ResetPasswordPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetForm>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: ResetForm) => {
    try {
      setLoading(true);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            otp: data.otp,
            newPassword: data.newPassword,
          }),
        },
      );

      const result = await res.json();

      if (result.success) {
        toast.success("Password reset successful");
        router.push("/auth/login");
      } else {
        toast.error(result.message || "Invalid OTP");
      }
    } catch (err) {
      toast.error("Server error");
    } finally {
      setLoading(false);
    }
  };

  if (!email) {
    return <p className="text-center mt-20">Invalid reset request</p>;
  }

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-64px)] px-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md p-8 bg-[var(--card-bg)] rounded-2xl shadow-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Reset Password</h2>

        <Input
          label="OTP"
          name="otp"
          type="text"
          placeholder="Enter OTP"
          register={register("otp", { required: "OTP is required" })}
          error={errors.otp?.message}
        />

        <Input
          label="New Password"
          name="newPassword"
          type="password"
          placeholder="Enter new password"
          register={register("newPassword", {
            required: "Password is required",
            minLength: {
              value: 6,
              message: "Minimum 6 characters",
            },
          })}
          error={errors.newPassword?.message}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 mt-4 bg-[var(--color-accent)] text-white rounded-md"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
};

export default ResetPasswordPage;
