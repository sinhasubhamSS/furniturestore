"use client";
import { useEffect } from "react";
import Navbar from "@/components/Navbar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const handler = () => {
      console.log("🚪 Force logout handled (MainLayout)");

      // Clear cookies
      document.cookie = "accessToken=; Max-Age=0; path=/";
      document.cookie = "refreshToken=; Max-Age=0; path=/";

      // Clear storage / redux / cache
      localStorage.clear();

      // Hard redirect
      window.location.href = "/auth/login";
    };

    window.addEventListener("force-logout", handler);
    return () => window.removeEventListener("force-logout", handler);
  }, []);

  return (
    <main>
      <div className="max-w-[1440px] mx-auto">
        <Navbar />
        {children}
      </div>
    </main>
  );
}
