"use client";

import { useForm } from "react-hook-form";
import { useLogin } from "@/hooks/useLogin";
import Input from "@/components/ui/Input";
import { useRouter, useSearchParams } from "next/navigation";
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
  const searchParams = useSearchParams();

  // read `from` param (e.g. /checkout)
  const rawFrom = (searchParams?.get("from") as string) || "/";

  // sanitize redirect target to prevent open-redirects
  const getSafeRedirect = (raw: string) => {
    if (!raw) return "/";
    // allow only internal paths that start with a single slash (no protocol)
    if (raw.startsWith("/") && !raw.startsWith("//")) return raw;
    return "/";
  };

  const onSubmit = async (data: LoginFormValues) => {
    const res = await login(data);
    if (res?.user?._id) {
      toast.success("Login successful! 🎉");

      // redirect back to original protected page (safe)
      const safe = getSafeRedirect(rawFrom);
      // use replace so back button doesn't take user back to login
      router.replace(safe);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-64px)] bg-[var(--background)] px-4 py-8">
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
            Don't have an account?{" "}
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
