"use client";

import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import Input from "@/components/ui/Input";
import OtpInput from "@/components/helperComponents/otpInput";
import { useState } from "react";

type ResetForm = {
  newPassword: string;
  confirmPassword: string;
};

const ResetPasswordPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResetForm>();

  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const newPassword = watch("newPassword");

  const onSubmit = async (data: ResetForm) => {
    if (otp.length !== 6) {
      toast.error("Enter complete 6-digit OTP");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            otp,
            newPassword: data.newPassword,
          }),
        },
      );

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Reset failed");
      }

      toast.success("Password reset successful 🎉");
      router.replace("/auth/login");
    } catch (err: any) {
      toast.error(err.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  if (!email) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-64px)]">
        <p className="text-center text-red-500">
          Invalid or expired reset request.
        </p>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-64px)] px-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md p-8 bg-[var(--card-bg)] rounded-2xl shadow-md transition"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-[var(--text-accent)]">
          Reset Password
        </h2>

        {/* OTP INPUT */}
        <div className="mb-5">
          <label className="block text-sm mb-2 font-medium">Enter OTP</label>
          <OtpInput length={6} value={otp} onChange={setOtp} />
        </div>

        {/* NEW PASSWORD */}
        <Input
          label="New Password"
          name="newPassword"
          type="password"
          placeholder="Enter new password"
          register={register("newPassword", {
            required: "Password is required",
            minLength: {
              value: 6,
              message: "Minimum 6 characters required",
            },
          })}
          error={errors.newPassword?.message}
        />

        {/* CONFIRM PASSWORD */}
        <Input
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          placeholder="Confirm new password"
          register={register("confirmPassword", {
            required: "Confirm your password",
            validate: (value) =>
              value === newPassword || "Passwords do not match",
          })}
          error={errors.confirmPassword?.message}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 mt-4 bg-[var(--color-accent)] text-white rounded-md font-medium hover:opacity-90 transition disabled:opacity-60"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
};

export default ResetPasswordPage;
