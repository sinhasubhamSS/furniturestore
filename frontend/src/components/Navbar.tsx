"use client";
import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FiShoppingCart,
  FiSearch,
  FiUser,
  FiChevronDown,
  FiX,
  FiHelpCircle,
} from "react-icons/fi";
import { RiLoginCircleLine } from "react-icons/ri";
import type { RootState } from "@/redux/store";
import Toggle from "@/components/helperComponents/Toogle";
import Link from "next/link";
import { clearActiveUser } from "@/redux/slices/userSlice";
import { useGetCartCountQuery } from "@/redux/services/user/cartApi";
import axiosClient from "../../utils/axios";

const Navbar = () => {
  const activeUser = useSelector((state: RootState) => state.user.activeUser);
  const dispatch = useDispatch();

  const { data: cartCountData, isLoading: cartCountLoading } =
    useGetCartCountQuery(undefined, { skip: !activeUser });

  const cartCount = cartCountData?.count || 0;

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSignOut = async () => {
    try {
      await axiosClient.post("/user/logout");
    } catch {
    } finally {
      dispatch(clearActiveUser());
      window.location.href = "/auth/login";
    }
  };

  /* Scroll Effect */
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* Close Dropdown */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-[1000] transition-all duration-300
      ${
        scrolled
          ? "bg-[var(--color-secondary)] shadow-lg border-b border-black/10"
          : "bg-white/20 backdrop-blur-md border-b border-white/30"
      }`}
    >
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3 gap-4">
          {/* Brand */}
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="font-extrabold text-[22px] tracking-wide text-[var(--color-accent)] uppercase"
            >
              suvidhawood
            </Link>

            <button
              className="sm:hidden p-2"
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            >
              {isMobileSearchOpen ? (
                <FiX className="h-5 w-5" />
              ) : (
                <FiSearch className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Desktop Search */}
          <div className="hidden sm:flex flex-1 max-w-xl mx-6">
            <div className="relative w-full">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 opacity-60" />
              <input
                type="text"
                placeholder="Search furniture..."
                className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white border border-black/10 text-sm focus:ring-2 focus:ring-[var(--color-accent)] transition"
              />
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Cart */}
            <Link href="/cart">
              <button className="relative p-2.5 rounded-xl hover:bg-black/5 transition">
                <FiShoppingCart className="h-5 w-5" />
                {activeUser && !cartCountLoading && cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[var(--color-accent)] text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
                {activeUser && cartCountLoading && (
                  <span className="absolute -top-1 -right-1 bg-gray-400 h-3 w-3 rounded-full animate-pulse" />
                )}
              </button>
            </Link>

            {/* User Dropdown */}
            <div ref={dropdownRef} className="relative">
              {activeUser ? (
                <>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 p-2 rounded-xl hover:bg-black/5 transition"
                  >
                    <FiUser className="h-5 w-5" />
                    <FiChevronDown
                      className={`h-4 w-4 transition-transform ${
                        isDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-3 w-64 rounded-xl bg-[var(--color-secondary)] shadow-xl border border-black/5 overflow-hidden">
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-black/5">
                        <p className="text-sm opacity-70">Signed in as</p>
                        <p className="text-sm font-semibold truncate">
                          {activeUser.name}
                        </p>
                      </div>

                      {/* Admin */}
                      {activeUser.role === "admin" && (
                        <Link
                          href="/admin/dashboard"
                          className="block px-4 py-3 text-sm hover:bg-[var(--color-accent)]/10"
                        >
                          🔧 Admin Dashboard
                        </Link>
                      )}

                      <Link
                        href="/my-profile"
                        className="block px-4 py-3 text-sm hover:bg-black/5"
                      >
                        👤 Your Profile
                      </Link>

                      <Link
                        href="/my-orders"
                        className="block px-4 py-3 text-sm hover:bg-black/5"
                      >
                        📦 My Orders
                      </Link>

                      <Link
                        href="/wishlist"
                        className="block px-4 py-3 text-sm hover:bg-black/5"
                      >
                        ❤️ My Wishlist
                      </Link>

                      {/* Theme Toggle */}
                      <div className="flex items-center justify-between px-4 py-3 border-t border-black/5">
                        <span className="text-sm">Theme</span>
                        <Toggle />
                      </div>

                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-50 border-t border-black/5"
                      >
                        🚪 Sign out
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="p-2 rounded-xl hover:bg-black/5 transition"
                  >
                    <FiHelpCircle className="h-5 w-5" />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-3 w-56 rounded-xl bg-white shadow-xl border border-black/5">
                      <div className="px-4 py-3">
                        <p className="text-sm">Guest User</p>
                      </div>
                      <Link
                        href="/auth/login"
                        className="block px-4 py-3 text-sm hover:bg-black/5"
                      >
                        <RiLoginCircleLine className="inline mr-2" />
                        Login / Register
                      </Link>

                      <div className="flex items-center justify-between px-4 py-3 border-t border-black/5">
                        <span className="text-sm">Theme</span>
                        <Toggle />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search */}
        {isMobileSearchOpen && (
          <div className="sm:hidden pb-3">
            <input
              type="text"
              placeholder="Search furniture..."
              className="w-full px-4 py-3 rounded-full bg-white border border-black/10"
              autoFocus
            />
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
