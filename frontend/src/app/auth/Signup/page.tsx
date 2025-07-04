"use client";

import { useForm } from "react-hook-form";
import { useSignup } from "@/hooks/useSignup";
import Input from "@/components/ui/Input";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { setActiveUser } from "@/redux/slices/userSlice";
import type { AppDispatch } from "@/redux/store";
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
    formState: { errors },
  } = useForm<SignupFormValues>({ mode: "onChange" });
  const dispatch = useDispatch<AppDispatch>();
  const { signup, loading, error } = useSignup();
  const router = useRouter();

  const onSubmit = async (data: SignupFormValues) => {
    const res = await signup(data);

    if (res?.user?._id) {
      toast.success("Signup successful! 🎉");
      router.push("/");
      dispatch(
        setActiveUser({
          _id: res.user._id,
          name: res.user.name,
          avatar: res.user.avatar,
          role: res.user.role ?? "buyer",
        })
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md bg-[var(--card-bg)] text-[var(--foreground)] p-8 rounded-2xl shadow-md transition-colors duration-300"
      >
        <h2 className="text-3xl font-bold mb-6 text-center text-[var(--text-accent)]">
          Create Account
        </h2>

        <Input
          label="Name"
          name="name"
          placeholder="Enter your name"
          register={register("name", { required: "Name is required" })}
          error={errors.name?.message}
        />
        <Input
          label="Email"
          name="email"
          type="email"
          placeholder="Enter your email"
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
          placeholder="Enter your password"
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
          placeholder="Confirm your password"
          register={register("confirmPassword", {
            required: "Please confirm your password",
          })}
          error={errors.confirmPassword?.message}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 mt-3 bg-[var(--color-accent)] text-white rounded-md font-medium hover:opacity-90 transition-all duration-200 disabled:opacity-60"
        >
          {loading ? "Signing up..." : "Sign up"}
        </button>

        {error && (
          <p className="text-[var(--text-error)] mt-3 text-sm text-center">
            {error}
          </p>
        )}

        <div className="mt-4 text-sm text-center">
          <span className="text-[var(--foreground)]">
            Already have an account?{" "}
          </span>
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
