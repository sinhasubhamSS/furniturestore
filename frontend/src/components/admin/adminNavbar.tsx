// components/admin/AdminNavbar.tsx
"use client";

import { FiBell } from "react-icons/fi";

export default function AdminNavbar() {
  return (
    <header className="w-full h-16 px-4 flex items-center justify-between bg-[var(--color-secondary)] text-[var(--foreground)] rounded-none">
      {/* Left: Page title or breadcrumb */}
      <h1 className="text-xl font-semibold">Dashboard</h1>

      {/* Right: Notification + Admin Profile */}
      <div className="flex items-center space-x-6">
        {/* Notification Icon */}
        <button className="relative text-[var(--foreground)] hover:text-[var(--color-accent)] transition-colors">
          <FiBell size={22} />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Admin Profile */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-[var(--color-accent)] text-white rounded-full flex items-center justify-center font-medium">
            AD
          </div>
          <span className="hidden md:inline font-medium">Admin</span>
        </div>
      </div>
    </header>
  );
}
