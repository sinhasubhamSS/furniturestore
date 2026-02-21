"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import Input from "@/components/ui/Input";
import { useState } from "react";

type ForgotForm = {
  email: string;
};

const ForgotPasswordPage = () => {
  const { register, handleSubmit, formState: { errors } } =
    useForm<ForgotForm>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: ForgotForm) => {
    try {
      setLoading(true);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

      const result = await res.json();

      if (result.success) {
        toast.success("OTP sent to your email");
        router.push(`/auth/reset-password?email=${data.email}`);
      } else {
        toast.error(result.message || "Something went wrong");
      }
    } catch (err) {
      toast.error("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-64px)] px-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md p-8 bg-[var(--card-bg)] rounded-2xl shadow-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">
          Forgot Password
        </h2>

        <Input
          label="Email"
          name="email"
          type="email"
          placeholder="Enter your email"
          register={register("email", { required: "Email is required" })}
          error={errors.email?.message}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 mt-4 bg-[var(--color-accent)] text-white rounded-md"
        >
          {loading ? "Sending..." : "Send OTP"}
        </button>
      </form>
    </div>
  );
};

export default ForgotPasswordPage;