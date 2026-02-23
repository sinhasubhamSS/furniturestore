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
};

const MAX_RESEND = 3;

const SignupPage = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupFormValues>();

  const { sendOtp, verifyOtp, loading, error } = useSignup();
  const router = useRouter();
  const dispatch = useDispatch();

  const [otpSent, setOtpSent] = useState(false);
  const [savedData, setSavedData] = useState<SignupFormValues | null>(null);
  const [otp, setOtp] = useState("");

  const [timer, setTimer] = useState(60);
  const [resendCount, setResendCount] = useState(0);

  const passwordValue = watch("password");

  /* Timer */
  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  /* Send OTP */
  const handleSendOtp = async (data: SignupFormValues) => {
    if (data.password !== data.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const res = await sendOtp(data);

    if (res?.success) {
      toast.success("OTP sent 📩");
      setSavedData(data);
      setOtpSent(true);
      setTimer(60);
      setResendCount(0);
    }
  };

  /* Verify OTP */
  const handleVerifyOtp = async () => {
    if (!savedData) return;

    if (otp.length !== 6) {
      toast.error("Enter complete 6-digit OTP");
      return;
    }

    const res = await verifyOtp({
      ...savedData,
      otp,
    });

    if (res?.success) {
      toast.success("Signup successful 🎉");
      dispatch(setActiveUser(res.userData));
      router.replace("/");
      router.refresh();
    }
  };

  /* Resend OTP */
  const handleResendOtp = async () => {
    if (!savedData) return;

    if (resendCount >= MAX_RESEND) {
      toast.error("Maximum resend attempts reached.");
      return;
    }

    const res = await sendOtp(savedData);

    if (res?.success) {
      toast.success("OTP resent 📩");
      setResendCount((prev) => prev + 1);
      setTimer(60);
      setOtp("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-[var(--card-bg)] p-8 rounded-2xl shadow-md">
        <h2 className="text-3xl font-bold text-center mb-6">Create Account</h2>

        {!otpSent ? (
          <form onSubmit={handleSubmit(handleSendOtp)} className="space-y-4">
            <Input
              label="Full Name"
              name="name"
              register={register("name", { required: "Name required" })}
              error={errors.name?.message}
            />

            <Input
              label="Email"
              name="email"
              type="email"
              register={register("email", { required: "Email required" })}
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
        ) : (
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
              {resendCount >= MAX_RESEND ? (
                <p className="text-red-500">Maximum resend attempts reached.</p>
              ) : timer > 0 ? (
                <p>Resend OTP in {timer}s</p>
              ) : (
                <button
                  onClick={handleResendOtp}
                  className="text-[var(--text-accent)] hover:underline"
                >
                  Resend OTP
                </button>
              )}
            </div>
          </div>
        )}

        {error && <p className="text-red-500 text-center mt-4">{error}</p>}

        <div className="mt-6 text-sm text-center">
          Already have an account?{" "}
          <Link href="/auth/login" className="underline">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
