// app/layout.tsx
"use client";

import "./globals.css";
import { Toaster } from "react-hot-toast";
import Toggle from "@/components/Toogle";
import { Provider } from "react-redux";
import { store } from "@/redux/store";
import Navbar from "@/components/Navbar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Prevent dark mode flash on load */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem("theme");
                  if (theme === "dark") {
                    document.documentElement.classList.add("dark");
                  } else {
                    document.documentElement.classList.remove("dark");
                  }
                } catch(_) {}
              })();
            `,
          }}
        />
      </head>

      <body className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300">
        <Provider store={store}>
          <Toaster position="top-center" />

          <Navbar />
          <Toggle />

          <main className="p-4">{children}</main>
        </Provider>
      </body>
    </html>
  );
}
