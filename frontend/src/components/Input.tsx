// components/Input.tsx
import React from "react";

// 👇 Interface defines props types. Helps with IntelliSense and safety
interface InputProps {
  label?: string; // Optional label text
  type?: string;  // input type (text, email, password, etc.)
  name: string;   // input name/id
  value: string;  // current value
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; // change handler
  placeholder?: string;
  required?: boolean;
}

// 👇 Functional component with props
const Input: React.FC<InputProps> = ({
  label,
  type = "text",        // default type = text
  name,
  value,
  onChange,
  placeholder,
  required = false,
}) => {
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
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-2 rounded-md bg-[var(--color-secondary)] text-[var(--foreground)] border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
      />
    </div>
  );
};

export default Input;
