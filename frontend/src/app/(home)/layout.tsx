import Navbar from "@/components/Navbar";
import Footer from "@/components/footer/index"; // Footer import karo
export const metadata = {
  robots: {
    index: true,
    follow: true,
  },
};
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Fixed Navbar */}
      <header className="fixed top-0 left-0 w-full z-50 bg-[var(--color-secondary)]">
        <div className="max-w-[1980px] mx-auto">
          <Navbar />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow pt-16">
        <div className="w-full">
          <div className="max-w-[1440px] sm:mx-auto px-0 sm:px-4 md:px-6 lg:px-8">
            {children}
          </div>
        </div>
      </main>

      {/* Footer - Automatically sticks to bottom */}
      <Footer />
    </div>
  );
}
