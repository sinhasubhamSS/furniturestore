"use client";
import { useEffect } from "react";

export default function ClientAuthListener() {
  useEffect(() => {
    const handler = () => {
      console.log("🚪 Force logout triggered");

      // Clear cookies
      document.cookie = "accessToken=; Max-Age=0; path=/";
      document.cookie = "refreshToken=; Max-Age=0; path=/";

      // Clear storage
      localStorage.clear();
      sessionStorage.clear();

      // Hard redirect
      window.location.href = "/auth/login";
    };

    window.addEventListener("force-logout", handler);
    return () => window.removeEventListener("force-logout", handler);
  }, []);

  return null;
}
