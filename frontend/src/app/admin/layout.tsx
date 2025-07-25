"use client";

import AdminNavbar from "@/components/admin/adminNavbar";
import Sidebar from "@/components/admin/sidebar";
import { useState, useEffect } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      // Auto-close sidebar on mobile
      if (mobile) {
        setIsSidebarOpen(false);
      } else {
        // Open sidebar on desktop
        setIsSidebarOpen(true);
      }
    };

    // Set initial state
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex min-h-screen ">
      <Sidebar
        isOpen={isSidebarOpen}
        toggle={() => setIsSidebarOpen(!isSidebarOpen)}
        isMobile={isMobile}
      />

      <div className="flex-1 overflow-hidden transition-all duration-300">
        <main
          className={`h-full overflow-y-auto transition-all duration-300 ${
            isSidebarOpen && !isMobile ? "ml-64" : "ml-0"
          } bg-[var(--secondary-light)]`}
        >
          <AdminNavbar /> {/* 👈 Use navbar here */}
          <div className="">{children}</div>
        </main>
      </div>
    </div>
  );
}
