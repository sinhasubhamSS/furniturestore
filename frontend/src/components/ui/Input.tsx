// components/ui/Input.tsx
import React from "react";
import { UseFormRegisterReturn } from "react-hook-form";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  name: string;
  register?: UseFormRegisterReturn;
  error?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  type = "text",
  name,
  placeholder,
  required = false,
  register,
  error,
  step,
  value,
  readOnly,
  disabled,
  onChange,
  onFocus,
  onBlur,
  ...rest
}) => {
  const isNumber = type === "number";

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (isNumber && e.target.value === "0") {
      e.target.value = "";
    }
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (isNumber && e.target.value.trim() === "") {
      e.target.value = "0";
    }
    onBlur?.(e);
  };

  return (
    <div className="mb-4 w-full">
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium mb-1 text-foreground"
        >
          {label}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        step={step}
        value={value}
        readOnly={readOnly}
        disabled={disabled}
        onChange={onChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...register}
        {...rest}
        className={`w-full px-2 py-2 rounded-md bg-[var(--color-secondary)] text-[var(--foreground)] border ${
          error
            ? "border-red-500 focus:ring-red-500"
            : "border-gray-300 dark:border-gray-600 focus:ring-[var(--color-accent)]"
        } focus:outline-none focus:ring-2`}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default Input;
