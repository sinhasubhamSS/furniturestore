"use client";

import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import Input from "@/components/ui/Input";
import OtpInput from "@/components/helperComponents/otpInput";
import { useState, useEffect } from "react";

type ResetForm = {
  newPassword: string;
  confirmPassword: string;
};

const MAX_RESEND = 3;

const ResetPasswordPage = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetForm>();

  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(60);
  const [resendCount, setResendCount] = useState(0);

  const newPassword = watch("newPassword");
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return <p>Invalid request</p>;
  }
  /* Timer */
  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  /* Resend */
  const handleResendOtp = async () => {
    if (!email) return;

    if (resendCount >= MAX_RESEND) {
      toast.error("Maximum resend attempts reached.");
      return;
    }

    try {
      setResending(true);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        },
      );

      const result = await res.json();

      if (!res.ok) throw new Error(result.message);

      toast.success("OTP resent 📩");
      setResendCount((prev) => prev + 1);
      setTimer(60);
      setOtp("");
    } catch (err: any) {
      toast.error(err.message || "Error resending OTP");
    } finally {
      setResending(false);
    }
  };

  /* Submit */
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
      if (!res.ok) throw new Error(result.message);

      toast.success("Password reset successful 🎉");
      router.replace("/auth/login");
    } catch (err: any) {
      toast.error(err.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  if (!email) return <p className="text-center mt-20">Invalid request</p>;

  return (
    <div className="flex justify-center items-center min-h-screen px-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md p-8 bg-[var(--card-bg)] rounded-2xl shadow-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Reset Password</h2>

        <OtpInput length={6} value={otp} onChange={setOtp} />

        <div className="text-center text-sm mt-3 mb-4">
          {resendCount >= MAX_RESEND ? (
            <p className="text-red-500">Maximum resend attempts reached.</p>
          ) : timer > 0 ? (
            <p>Resend OTP in {timer}s</p>
          ) : (
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resending}
              className="underline"
            >
              {resending ? "Resending..." : "Resend OTP"}
            </button>
          )}
        </div>

        <Input
          label="New Password"
          name="newPassword"
          type="password"
          register={register("newPassword", {
            required: "Password required",
            minLength: { value: 6, message: "Minimum 6 characters" },
          })}
          error={errors.newPassword?.message}
        />

        <Input
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          register={register("confirmPassword", {
            validate: (val) => val === newPassword || "Passwords do not match",
          })}
          error={errors.confirmPassword?.message}
        />

        <button
          type="submit"
          disabled={loading || otp.length !== 6}
          className="w-full py-2 mt-4 bg-[var(--color-accent)] text-white rounded-md"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
};

export default ResetPasswordPage;
