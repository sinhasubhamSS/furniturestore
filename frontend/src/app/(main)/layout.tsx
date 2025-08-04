// app/(main)/layout.tsx
import Navbar from "@/components/Navbar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="w-full pt-16">
      {/* Navbar with full width and background */}
      <div className="w-full bg-[var(--color-secondary)]">
        <div className="max-w-[1980px] mx-auto">
          <Navbar />
        </div>
      </div>

      {/* Page content with max width 1440px */}
      <div className="w-full">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8">
          {children}
        </div>
      </div>
    </main>
  );
}
