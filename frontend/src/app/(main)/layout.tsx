// app/(main)/layout.tsx
import Navbar from "@/components/Navbar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main>
      <div className="max-w-[1440px] mx-auto">
        {/* Fixed Navbar (height: 4rem = h-16) */}
        <Navbar />

        {/* Content with automatic spacing (pt-16 = Navbar height) */}
        <div className="">
          {children} {/* HeroSection, etc. ko extra padding ki zaroorat nahi */}
        </div>
      </div>
    </main>
  );
}
