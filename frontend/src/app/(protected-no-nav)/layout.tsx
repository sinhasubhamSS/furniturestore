
// app/(protected)/layout.tsx
"use client";

import React from "react";

import Footer from "@/components/footer";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-primary)] text-[var(--color-foreground)]">
      {/* Fixed Navbar */}
      {/* <header className="fixed top-0 left-0 w-full z-50 bg-[var(--color-secondary)]">
        <div className="max-w-[1440px] mx-auto px-0 sm:px-4 md:px-6 lg:px-8">
          <Navbar />
        </div>
      </header> */}

      {/* Main content (space for fixed navbar) */}
      <main className="flex-grow ">
        <div className="w-full">
          <div className="max-w-[1440px] mx-auto px-0 sm:px-4 md:px-6 lg:px-8">
            {children}
          </div>
        </div>
      </main>

 
    </div>
  );
}
