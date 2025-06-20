"use client";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { FiShoppingCart, FiSearch, FiUser, FiArrowRight } from "react-icons/fi";
import type { RootState } from "@/redux/store";

const Navbar = () => {
  const activeUser = useSelector((state: RootState) => state.user.activeUser);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-md bg-[var(--card-bg)]/60  border-b border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
      <div className="max-w-8xl mx-auto px-2 py-3 flex items-center justify-between text-sm text-[var(--foreground)]">

        {/* Left: Logo + Search */}
        <div className="flex items-center gap-6">
          {/* Logo */}
          <div className="font-bold text-lg tracking-wide text-[var(--text-accent)]">
            SUVIDHA
          </div>

          {/* Search */}
          <div className="hidden sm:flex items-center gap-2 bg-[var(--color-secondary)] px-4 py-2 rounded-full focus-within:ring-2 ring-[var(--color-accent)] transition w-64">
            <FiSearch size={18} className="text-[var(--foreground)]" />
            <input
              type="text"
              placeholder="Search products..."
              className="bg-transparent outline-none text-sm w-full text-[var(--foreground)] placeholder:text-gray-500 dark:placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Right: Cart + User */}
        <div className="flex gap-5 items-center relative">
          {/* Cart */}
          <button className="relative p-1 hover:text-[var(--color-accent)] transition">
            <FiShoppingCart size={20} className="text-[var(--foreground)]" />
          </button>

          {/* User Avatar Section */}
          {activeUser ? (
            <div
              className="relative flex items-center gap-2 cursor-pointer"
              onMouseEnter={() => setIsDropdownOpen(true)}
              onMouseLeave={() => setIsDropdownOpen(false)}
            >
              {/* Avatar (real or fallback) */}
              {activeUser.avatar ? (
                <img
                  src={activeUser.avatar}
                  alt="User Avatar"
                  className="w-8 h-8 rounded-full object-cover border border-[var(--color-accent)]"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[var(--color-accent)] text-white flex items-center justify-center text-sm">
                  <FiUser className="text-[var(--foreground)]" />
                </div>
              )}

              {/* Name */}
              <span className="hidden sm:inline text-sm font-medium text-[var(--foreground)]">
                {activeUser.name.split(" ")[0]}
              </span>

              {/* Dropdown */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-10 w-40 bg-[var(--color-secondary)] rounded-lg shadow-lg border border-white/10 p-2 z-50">
                  <button className="block w-full text-left px-2 py-1 rounded hover:bg-[var(--card-bg)] transition text-sm">
                    Profile
                  </button>
                  <button className="block w-full text-left px-2 py-1 rounded hover:bg-[var(--card-bg)] transition text-sm">
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div
              onClick={() => (window.location.href = "/auth/login")}
              className="flex items-center gap-2 cursor-pointer group"
              title="Click to login"
            >
              <div className="w-8 h-8 rounded-full bg-[var(--color-accent)] text-white flex items-center justify-center text-sm">
                <FiUser className="text-[var(--foreground)]" />
              </div>
              <FiArrowRight className="text-[var(--foreground)] opacity-70 group-hover:opacity-100 transition" />
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
