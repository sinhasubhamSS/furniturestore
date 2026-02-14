"use client";

import { useForm } from "react-hook-form";
import { useSignup } from "@/hooks/useSignup";
import Input from "@/components/ui/Input";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { useState } from "react";

type SignupFormValues = {
  name: string;
  avatar?: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const SignupPage = () => {
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

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
    <div className="min-h-screen flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md p-8 rounded-xl shadow-md"
      >
        <h2 className="text-3xl font-bold mb-6 text-center">Create Account</h2>

        <Input
          label="Name"
          name="name"
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
            required: "Password is required",
            minLength: { value: 6, message: "Minimum 6 characters" },
          })}
          error={errors.password?.message}
        />

        <Input
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          register={register("confirmPassword", {
            validate: (value) =>
              value === passwordValue || "Passwords do not match",
          })}
          error={errors.confirmPassword?.message}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 mt-4 bg-black text-white rounded-md"
        >
          {loading ? "Signing up..." : "Sign up"}
        </button>

        {error && <p className="text-red-500 mt-2 text-center">{error}</p>}

        <div className="mt-4 text-center">
          <Link href="/auth/login">Already have an account?</Link>
        </div>
      </form>
    </div>
  );
};

export default SignupPage;
