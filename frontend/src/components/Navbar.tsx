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
import { useRouter } from "next/navigation";
import { clearActiveUser } from "@/redux/slices/userSlice";
import { useGetCartCountQuery } from "@/redux/services/user/cartApi";

const Navbar = () => {
  const activeUser = useSelector((state: RootState) => state.user.activeUser);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();
  const router = useRouter();
  const { data: cartCount, isLoading: cartCountLoading } =
    useGetCartCountQuery();

  const handleSignOut = () => {
    dispatch(clearActiveUser());
    router.push("/auth/login");
  };

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
    <nav className="sticky top-0 z-[1000] w-full bg-[var(--color-secondary)] backdrop-blur border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3 gap-4">
          {/* Left */}
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="font-bold text-xl tracking-tight text-[var(--text-accent)] hover:scale-105 transition-transform duration-300"
            >
              SUVIDHA
            </Link>

            <button
              className="sm:hidden p-2"
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            >
              {isMobileSearchOpen ? (
                <FiX className="h-5 w-5 text-[var(--foreground)]" />
              ) : (
                <FiSearch className="h-5 w-5 text-[var(--foreground)]" />
              )}
            </button>
          </div>

          {/* Search (Desktop) */}
          <div className="hidden sm:flex flex-1 max-w-xl mx-4">
            <div className="relative group w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-[var(--foreground)] opacity-70" />
              </div>
              <input
                type="text"
                placeholder="Search furniture, decor..."
                className="block w-full pl-10 pr-3 py-2.5 rounded-full bg-[var(--color-secondary)] focus:ring-2 focus:ring-[var(--color-accent)] text-sm text-[var(--foreground)] placeholder-gray-500 transition-all"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <kbd className="px-2 py-1 text-xs rounded bg-[var(--card-bg)] text-[var(--foreground)] opacity-70">
                  ⌘K
                </kbd>
              </div>
            </div>
          </div>

          {/* Right: Cart + User */}
          <div className="flex items-center gap-4">
            <Link href="/cart">
              <button className="relative p-2 group">
                <FiShoppingCart className="h-6 w-6 text-[var(--foreground)] group-hover:text-[var(--color-accent)]" />

                {!cartCountLoading && (cartCount ?? 0) > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[var(--color-accent)] text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-bounce">
                    {cartCount ?? 0}
                  </span>
                )}
              </button>
            </Link>

            <div ref={dropdownRef} className="relative">
              {activeUser ? (
                <>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 group"
                  >
                    {activeUser.avatar ? (
                      <img
                        src={activeUser.avatar}
                        alt="User"
                        className="h-8 w-8 rounded-full object-cover border-2 border-transparent group-hover:border-[var(--color-accent)]"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[var(--color-accent)] to-purple-500 flex items-center justify-center text-white">
                        <FiUser className="h-4 w-4" />
                      </div>
                    )}
                    <FiChevronDown
                      className={`h-4 w-4 text-[var(--foreground)] transition-transform ${
                        isDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-lg bg-[var(--card-bg)] shadow-lg ring-1 ring-black ring-opacity-5 border border-white/10">
                      <div className="px-4 py-3">
                        <p className="text-sm text-[var(--foreground)]">
                          Signed in as
                        </p>
                        <p className="text-sm truncate text-[var(--text-accent)]">
                          {activeUser.name}
                        </p>
                      </div>

                      {activeUser.role === "admin" && (
                        <div className="py-1">
                          <Link
                            href="/admin/dashboard"
                            className="block px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--color-secondary)]"
                          >
                            Admin Dashboard
                          </Link>
                        </div>
                      )}

                      <div className="py-1">
                        <Link
                          href="/profile"
                          className="block px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--color-secondary)]"
                        >
                          Your Profile
                        </Link>
                        <Link
                          href="/my-orders"
                          className="block px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--color-secondary)]"
                        >
                          My Orders
                        </Link>
                      </div>

                      <div className="py-1">
                        <div className="flex items-center justify-between px-4 py-2">
                          <span className="text-sm text-[var(--foreground)]">
                            Theme
                          </span>
                          <Toggle />
                        </div>
                      </div>

                      <div className="py-1">
                        <button
                          onClick={handleSignOut}
                          className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-500/10"
                        >
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 group"
                  >
                    <div className="h-8 w-8 rounded-full bg-[var(--color-secondary)] flex items-center justify-center">
                      <FiHelpCircle className="h-5 w-5 text-[var(--foreground)]" />
                    </div>
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-lg bg-[var(--card-bg)] shadow-lg ring-1 ring-black ring-opacity-5 border border-white/10">
                      <div className="px-4 py-3">
                        <p className="text-sm text-[var(--foreground)]">
                          Guest User
                        </p>
                        <p className="text-sm text-[var(--text-accent)]">
                          Please login for full access
                        </p>
                      </div>
                      <div className="py-1">
                        <Link
                          href="/auth/login"
                          className=" px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--color-secondary)] flex items-center gap-2"
                        >
                          <RiLoginCircleLine className="h-4 w-4" />
                          Login / Register
                        </Link>
                      </div>
                      <div className="py-1 border-t border-white/10">
                        <div className="flex items-center justify-between px-4 py-2">
                          <span className="text-sm text-[var(--foreground)]">
                            Theme
                          </span>
                          <Toggle />
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Input */}
        {isMobileSearchOpen && (
          <div className="sm:hidden pb-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search furniture, decor..."
                className="block w-full pl-10 pr-12 py-3 rounded-full bg-[var(--color-secondary)] focus:ring-2 focus:ring-[var(--color-accent)] text-sm text-[var(--foreground)] placeholder-gray-500"
                autoFocus
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-[var(--foreground)]" />
              </div>
              <button
                onClick={() => setIsMobileSearchOpen(false)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <FiX className="h-5 w-5 text-[var(--foreground)]" />
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
