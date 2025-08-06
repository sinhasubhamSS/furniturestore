// components/ui/Input.tsx
import React from "react";
import { UseFormRegisterReturn } from "react-hook-form";

interface InputProps {
  label?: string;
  type?: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  register?: UseFormRegisterReturn;
  error?: string;
  step?: string;
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

}) => {
  const isNumber = type === "number";

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (isNumber && e.target.value === "0") {
      e.target.value = "";
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (isNumber && e.target.value.trim() === "") {
      e.target.value = "0";
    }
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
        {...register}
        onFocus={handleFocus}
        onBlur={handleBlur}
          step={step}
        
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
