"use client";
import { useEffect, useState } from "react";

const Toggle = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Always default to light unless user explicitly chose dark
    const stored = localStorage.getItem("theme");

    if (stored === "dark") {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    } else {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = isDark ? "light" : "dark";
    localStorage.setItem("theme", newTheme);

    document.documentElement.classList.toggle("dark");
    setIsDark(!isDark);
  };

  return (
    <button
      onClick={toggleTheme}
      className="px-4 py-2 rounded-sm  text-xl"
    >
      {isDark ? "🌞" : "🌙"}
    </button>
  );
};

export default Toggle;
