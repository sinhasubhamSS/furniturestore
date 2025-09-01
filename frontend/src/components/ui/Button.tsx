import React from "react";

// ✅ Updated interface for button component
interface ButtonProps {
  children?: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void; // ✅ Accept event parameter
  type?: "button" | "submit" | "reset";
  className?: string;
  disabled?: boolean;
  variant?: "default" | "outline" | "ghost"; // ✅ Added variant support
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  type = "button",
  className = "",
  disabled = false,
  variant = "default",
}) => {
  // ✅ Variant-based styling
  const getVariantStyles = () => {
    switch (variant) {
      case "outline":
        return "border border-[var(--color-accent)] text-[var(--color-accent)] bg-transparent hover:bg-[var(--color-accent)] hover:text-white";
      case "ghost":
        return "bg-transparent text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10";
      default:
        return "bg-[var(--color-accent)] text-white hover:opacity-90";
    }
  };

  return (
    <button
      type={type}
      onClick={onClick} // ✅ Now accepts event parameter
      disabled={disabled}
      className={`
        px-4 py-2 rounded-md
        ${getVariantStyles()}
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        cursor-pointer
        font-medium
        ${className}
      `}
    >
      {children}
    </button>
  );
};

export default Button;
