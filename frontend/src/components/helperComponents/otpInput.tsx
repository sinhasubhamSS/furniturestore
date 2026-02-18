"use client";
import { useRef } from "react";

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (otp: string) => void;
}

const OtpInput = ({ length = 6, value, onChange }: OtpInputProps) => {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    const val = e.target.value.replace(/\D/, ""); // only numbers
    if (!val) return;

    const newOtp = value.split("");
    newOtp[index] = val;
    const updatedOtp = newOtp.join("");
    onChange(updatedOtp);

    // move to next
    if (index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (e.key === "Backspace") {
      const newOtp = value.split("");
      newOtp[index] = "";
      onChange(newOtp.join(""));

      if (index > 0) {
        inputsRef.current[index - 1]?.focus();
      }
    }
  };

  return (
    <div className="flex justify-center gap-3">
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => {
            inputsRef.current[index] = el;
          }}
          type="text"
          maxLength={1}
          value={value[index] || ""}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          className="w-12 h-12 text-center text-lg font-semibold border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
        />
      ))}
    </div>
  );
};

export default OtpInput;
