"use client";

import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import { closeLoginModal, setActiveUser } from "@/redux/slices/userSlice";
import { useLogin } from "@/hooks/useLogin";
import { useForm } from "react-hook-form";
import Input from "@/components/ui/Input";
import { toast } from "react-hot-toast";

type LoginFormValues = {
  email: string;
  password: string;
};

const LoginModal = () => {
  const dispatch = useDispatch();
  const { login, loading, error } = useLogin();

  const isOpen = useSelector((state: RootState) => state.user.isLoginModalOpen);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>();

  if (!isOpen) return null;

  const onSubmit = async (data: LoginFormValues) => {
    const res = await login(data);

    if (res?.userData?._id) {
      toast.success("Login successful 🎉");

      dispatch(setActiveUser(res.userData));
      dispatch(closeLoginModal());
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[var(--card-bg)] text-[var(--foreground)] p-6 rounded-2xl w-full max-w-md relative shadow-lg">
        {/* Close Button */}
        <button
          onClick={() => dispatch(closeLoginModal())}
          className="absolute top-3 right-4 text-xl font-bold"
        >
          ×
        </button>

        <h2 className="text-2xl font-bold text-center mb-6 text-[var(--text-accent)]">
          Login Required
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email"
            name="email"
            type="email"
            placeholder="Enter your email"
            register={register("email", {
              required: "Email is required",
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
            className="w-full py-2 bg-[var(--color-accent)] text-white rounded-md font-medium hover:opacity-90 transition-all duration-200 disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          {error && (
            <p className="text-[var(--text-error)] text-sm text-center">
              {error}
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
