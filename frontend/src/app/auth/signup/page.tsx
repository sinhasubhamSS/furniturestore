"use client";

import { useForm } from "react-hook-form";
import { useSignup } from "@/hooks/useSignup";
import Input from "@/components/ui/Input";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import Link from "next/link";

type SignupFormValues = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const SignupPage = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupFormValues>({ mode: "onChange" });

  const { signup, loading, error } = useSignup();
  const router = useRouter();
  const passwordValue = watch("password");

  const onSubmit = async (data: SignupFormValues) => {
    if (data.password !== data.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const res = await signup(data);

    if (res?.success) {
      toast.success("Verification email sent! 📩");
      router.push("/auth/verify-notice");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4 py-8">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md bg-[var(--card-bg)] text-[var(--foreground)] p-8 rounded-2xl shadow-md transition-colors duration-300"
      >
        <h2 className="text-3xl font-bold mb-2 text-center text-[var(--text-accent)]">
          Create Account
        </h2>

        <p className="text-center text-sm mb-6 opacity-70">
          Join Suvidha Wood today
        </p>

        <div className="space-y-4">
          <Input
            label="Full Name"
            name="name"
            type="text"
            placeholder="John Doe"
            register={register("name", {
              required: "Name is required",
            })}
            error={errors.name?.message}
          />

          <Input
            label="Email Address"
            name="email"
            type="email"
            placeholder="john@example.com"
            register={register("email", {
              required: "Email is required",
              pattern: {
                value: /^\S+@\S+$/i,
                message: "Invalid email address",
              },
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
            placeholder="Re-enter your password"
            register={register("confirmPassword", {
              validate: (value) =>
                value === passwordValue || "Passwords do not match",
            })}
            error={errors.confirmPassword?.message}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 mt-6 bg-[var(--color-accent)] text-white rounded-md font-medium hover:opacity-90 transition-all duration-200 disabled:opacity-60"
        >
          {loading ? "Creating account..." : "Sign Up"}
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
