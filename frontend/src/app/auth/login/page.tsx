"use client";

import { useForm } from "react-hook-form";
import { useLogin } from "@/hooks/useLogin";
import Input from "@/components/ui/Input";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import Link from "next/link";

type LoginFormValues = {
  email: string;
  password: string;
};

const LoginPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ mode: "onChange" });

  const { login, loading, error } = useLogin();
  const router = useRouter();

  const onSubmit = async (data: LoginFormValues) => {
    const res = await login(data);
    if (res?.user?._id) {
      toast.success("Login successful! 🎉");
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md bg-[var(--card-bg)] text-[var(--foreground)] p-8 rounded-2xl shadow-md transition-colors duration-300"
      >
        <h2 className="text-3xl font-bold mb-6 text-center text-[var(--text-accent)]">
          Welcome Back
        </h2>

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
          })}
          error={errors.password?.message}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 mt-3 bg-[var(--color-accent)] text-white rounded-md font-medium hover:opacity-90 transition-all duration-200 disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Log in"}
        </button>

        {error && (
          <p className="text-[var(--text-error)] mt-3 text-sm text-center">
            {error}
          </p>
        )}

        <div className="mt-4 text-sm text-center">
          <span className="text-[var(--foreground)]">
            Don&apos;t have an account?{" "}
          </span>
          <Link
            href="/auth/signup"
            className="text-[var(--text-accent)] font-medium hover:underline"
          >
            Sign up
          </Link>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
