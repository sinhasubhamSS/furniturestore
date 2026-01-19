"use client";

import Sidebar from "@/components/admin/sidebar";
import AdminNavbar from "@/components/admin/adminNavbar";
import { useState, useEffect } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Detect screen size
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setIsSidebarOpen(!mobile);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Lock body scroll on mobile sidebar open
  useEffect(() => {
    if (isMobile && isSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobile, isSidebarOpen]);

  return (
    <div className="flex min-h-screen">
      <Sidebar
        isOpen={isSidebarOpen}
        toggle={() => setIsSidebarOpen((p) => !p)}
        isMobile={isMobile}
      />

      {/* MAIN CONTENT */}
      <main
        className={`
          flex-1 transition-all duration-300 bg-[var(--secondary-light)]
          ${!isMobile && isSidebarOpen ? "ml-64" : "ml-0"}
          ${
            isMobile && isSidebarOpen
              ? "opacity-0 pointer-events-none"
              : "opacity-100 pointer-events-auto"
          }
        `}
      >
        {/* Hide navbar on mobile when sidebar is open */}
        {!(isMobile && isSidebarOpen) && <AdminNavbar />}

        <div>{children}</div>
      </main>
    </div>
  );
}
