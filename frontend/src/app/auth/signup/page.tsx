"use client";

import { useForm } from "react-hook-form";
import { useSignup } from "@/hooks/useSignup";
import Input from "@/components/ui/Input";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { useState } from "react";
import OtpInput from "@/components/helperComponents/otpInput";
type SignupFormValues = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  otp?: string;
};

const SignupPage = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupFormValues>({ mode: "onChange" });

  const { sendOtp, verifyOtp, loading, error } = useSignup();
  const router = useRouter();

  const [otpSent, setOtpSent] = useState(false);
  const [savedData, setSavedData] = useState<SignupFormValues | null>(null);

  const passwordValue = watch("password");

  /* ===============================
     STEP 1 → SEND OTP
  =============================== */

  const handleSendOtp = async (data: SignupFormValues) => {
    if (data.password !== data.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const res = await sendOtp(data);

    if (res?.success) {
      toast.success("OTP sent to your email 📩");
      setSavedData(data);
      setOtpSent(true);
    }
  };

  /* ===============================
     STEP 2 → VERIFY OTP
  =============================== */

  const handleVerifyOtp = async (data: SignupFormValues) => {
    if (!savedData) return;

    const res = await verifyOtp({
      name: savedData.name,
      email: savedData.email,
      password: savedData.password,
      otp: data.otp!,
    });

    if (res?.success) {
      toast.success("Signup successful 🎉");
      router.push("/auth/login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4 py-8">
      <form
        onSubmit={handleSubmit(otpSent ? handleVerifyOtp : handleSendOtp)}
        className="w-full max-w-md bg-[var(--card-bg)] text-[var(--foreground)] p-8 rounded-2xl shadow-md"
      >
        <h2 className="text-3xl font-bold mb-2 text-center text-[var(--text-accent)]">
          Create Account
        </h2>

        <p className="text-center text-sm mb-6 opacity-70">
          Join Suvidha Wood today
        </p>

        {!otpSent && (
          <div className="space-y-4">
            <Input
              label="Full Name"
              name="name"
              type="text"
              placeholder="John Doe"
              register={register("name", { required: "Name is required" })}
              error={errors.name?.message}
            />

            <Input
              label="Email Address"
              name="email"
              type="email"
              placeholder="john@example.com"
              register={register("email", {
                required: "Email is required",
              })}
              error={errors.email?.message}
            />

            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="Minimum 6 characters"
              register={register("password", {
                required: "Password is required",
                minLength: { value: 6, message: "Minimum 6 characters" },
              })}
              error={errors.password?.message}
            />

            <Input
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              placeholder="Re-enter password"
              register={register("confirmPassword", {
                validate: (value) =>
                  value === passwordValue || "Passwords do not match",
              })}
              error={errors.confirmPassword?.message}
            />
          </div>
        )}

        {otpSent && (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-center">
              Enter 6 Digit OTP
            </label>

            <OtpInput
              value={watch("otp") || ""}
              onChange={(val) => {
                // manually update react-hook-form
                const event = {
                  target: { name: "otp", value: val },
                } as any;
                register("otp", {
                  required: "OTP is required",
                  minLength: { value: 6, message: "Enter full 6 digit OTP" },
                }).onChange(event);
              }}
            />

            {errors.otp && (
              <p className="text-sm text-red-500 text-center">
                {errors.otp.message}
              </p>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 mt-6 bg-[var(--color-accent)] text-white rounded-md font-medium hover:opacity-90 transition-all duration-200 disabled:opacity-60"
        >
          {loading ? "Please wait..." : otpSent ? "Verify OTP" : "Send OTP"}
        </button>

        {error && (
          <p className="text-[var(--text-error)] mt-4 text-sm text-center">
            {error}
          </p>
        )}

        <div className="mt-6 text-sm text-center">
          <span className="opacity-80">Already have an account? </span>
          <Link
            href="/auth/login"
            className="text-[var(--text-accent)] font-medium hover:underline"
          >
            Log in
          </Link>
        </div>
      </form>
    </div>
  );
};

export default SignupPage;
