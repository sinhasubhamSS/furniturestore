// app/MainLayout.tsx
"use client";
import Navbar from "@/components/Navbar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main>
      <div className="max-w-[1440px] mx-auto">
        <Navbar />
        {children}
      </div>
    </main>
  );
}
