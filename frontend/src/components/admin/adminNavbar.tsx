"use client";

import { FiMenu } from "react-icons/fi";
import { MdClose } from "react-icons/md";

type AdminNavbarProps = {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
};

export default function AdminNavbar({
  toggleSidebar,
  isSidebarOpen,
}: AdminNavbarProps) {
  return (
    <header className="bg-[var(--color-secondary)] text-[var(--foreground)] shadow px-6 py-4 flex items-center justify-between z-40 border-b border-[var(--color-accent)]">
      <div className="flex items-center space-x-4">
        {/* Sidebar toggle button - only show on mobile */}
        <button
          className="md:hidden text-2xl text-[var(--foreground)]"
          onClick={toggleSidebar}
        >
          {isSidebarOpen ? <MdClose size={24} /> : <FiMenu size={24} />}
        </button>
        <h1 className="text-lg font-semibold">Dashboard Overview</h1>
      </div>

      {/* User profile */}
      <div className="flex items-center">
        <div className="relative">
          <button className="p-1 rounded-full hover:bg-[var(--color-accent)] hover:text-white transition-colors">
            <div className="w-8 h-8 rounded-full bg-[var(--color-accent)] flex items-center justify-center text-white text-sm">
              JD
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
