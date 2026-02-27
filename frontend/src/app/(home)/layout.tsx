import Navbar from "@/components/Navbar";
import Footer from "@/components/footer/index";

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
      <header className="fixed top-0 left-0 w-full h-16 z-50">
        <Navbar />
      </header>

      {/* Main Content */}
      <main className="flex-grow">{children}</main>

      <Footer />
    </div>
  );
}
