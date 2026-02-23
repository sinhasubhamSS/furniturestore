"use client";

import { useForm } from "react-hook-form";
import { useSignup } from "@/hooks/useSignup";
import Input from "@/components/ui/Input";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { useState, useEffect } from "react";
import OtpInput from "@/components/helperComponents/otpInput";
import { useDispatch } from "react-redux";
import { setActiveUser } from "@/redux/slices/userSlice";

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
    setValue,
    formState: { errors },
  } = useForm<SignupFormValues>({ mode: "onChange" });

  const { sendOtp, verifyOtp, loading, error } = useSignup();
  const router = useRouter();
  const dispatch = useDispatch();

  const [otpSent, setOtpSent] = useState(false);
  const [savedData, setSavedData] = useState<SignupFormValues | null>(null);
  const [otp, setOtp] = useState("");

  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const passwordValue = watch("password");

  /* =============================
     ⏳ TIMER LOGIC
  ============================= */

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (otpSent && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }

    return () => clearInterval(interval);
  }, [otpSent, timer]);

  /* =============================
     SEND OTP
  ============================= */

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
      setTimer(60);
      setCanResend(false);
    }
  };

  /* =============================
     VERIFY OTP
  ============================= */

  const handleVerifyOtp = async () => {
    if (!savedData) return;

    if (otp.length !== 6) {
      toast.error("Enter complete 6-digit OTP");
      return;
    }

    const res = await verifyOtp({
      name: savedData.name,
      email: savedData.email,
      password: savedData.password,
      otp,
    });

    if (res?.success) {
      toast.success("Signup successful 🎉");
      dispatch(setActiveUser(res.userData));
      router.replace("/");
      router.refresh();
    }
  };

  /* =============================
     RESEND OTP
  ============================= */

  const handleResendOtp = async () => {
    if (!savedData) return;

    const res = await sendOtp(savedData);

    if (res?.success) {
      toast.success("OTP resent successfully 📩");
      setTimer(60);
      setCanResend(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4 py-8">
      <div className="w-full max-w-md bg-[var(--card-bg)] text-[var(--foreground)] p-8 rounded-2xl shadow-md">
        <h2 className="text-3xl font-bold mb-2 text-center text-[var(--text-accent)]">
          Create Account
        </h2>

        <p className="text-center text-sm mb-6 opacity-70">
          Join Suvidha Wood today
        </p>

        {!otpSent && (
          <form onSubmit={handleSubmit(handleSendOtp)} className="space-y-4">
            <Input
              label="Full Name"
              name="name"
              type="text"
              register={register("name", { required: "Name is required" })}
              error={errors.name?.message}
            />

            <Input
              label="Email"
              name="email"
              type="email"
              register={register("email", { required: "Email is required" })}
              error={errors.email?.message}
            />

            <Input
              label="Password"
              name="password"
              type="password"
              register={register("password", {
                required: "Password required",
                minLength: { value: 6, message: "Minimum 6 characters" },
              })}
              error={errors.password?.message}
            />

            <Input
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              register={register("confirmPassword", {
                validate: (val) =>
                  val === passwordValue || "Passwords do not match",
              })}
              error={errors.confirmPassword?.message}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-[var(--color-accent)] text-white rounded-md"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>
        )}

        {otpSent && (
          <div className="space-y-5">
            <OtpInput length={6} value={otp} onChange={setOtp} />

            <button
              onClick={handleVerifyOtp}
              disabled={loading}
              className="w-full py-2 bg-[var(--color-accent)] text-white rounded-md"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            <div className="text-center text-sm">
              {!canResend ? (
                <p className="opacity-70">Resend OTP in {timer}s</p>
              ) : (
                <button
                  onClick={handleResendOtp}
                  className="text-[var(--text-accent)] hover:underline font-medium"
                >
                  Resend OTP
                </button>
              )}
            </div>
          </div>
        )}

        {error && (
          <p className="text-red-500 text-center mt-4 text-sm">{error}</p>
        )}

        <div className="mt-6 text-sm text-center">
          <span>Already have an account? </span>
          <Link
            href="/auth/login"
            className="text-[var(--text-accent)] hover:underline"
          >
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
