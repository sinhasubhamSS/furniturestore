"use client";
import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FiShoppingCart,
  FiSearch,
  FiUser,
  FiChevronDown,
  FiX,
} from "react-icons/fi";
import { RiLoginCircleLine } from "react-icons/ri";
import type { RootState } from "@/redux/store";
import Link from "next/link";
import { clearActiveUser } from "@/redux/slices/userSlice";
import { useGetCartCountQuery } from "@/redux/services/user/cartApi";
import axiosClient from "../../utils/axios";

const Navbar = () => {
  const activeUser = useSelector((state: RootState) => state.user.activeUser);

  const { data: cartCountData, isLoading: cartCountLoading } =
    useGetCartCountQuery(undefined, {
      skip: !activeUser,
    });

  const cartCount = cartCountData?.count || 0;

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();

  const handleSignOut = async () => {
    try {
      await axiosClient.post("/user/logout");
    } catch {
      console.warn("Logout API failed");
    } finally {
      dispatch(clearActiveUser());
      window.location.href = "/auth/login";
    }
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
    <nav
      className="w-full h-16 flex items-center
                 bg-[var(--color-secondary)]/85
                 backdrop-blur-xl
                 border-b border-black/10
                 shadow-[0_6px_25px_rgba(0,0,0,0.06)]"
    >
      {/* 👇 almost full left */}
      <div className="w-full max-w-[1440px] mx-auto h-16 flex items-center justify-between pl-0 pr-6">
        {/* Left - Brand */}
        <div className="flex items-center gap-4 pl-2">
          <Link
            href="/"
            className="font-extrabold text-[22px] tracking-wide
                       text-[var(--color-accent)]
                       uppercase"
          >
            suvidhawood
          </Link>

          <button
            className="sm:hidden p-2 text-black"
            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
          >
            {isMobileSearchOpen ? (
              <FiX className="h-5 w-5" />
            ) : (
              <FiSearch className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Center - Search */}
        <div className="hidden sm:flex flex-1 max-w-2xl mx-8">
          <div className="relative w-full">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-black/60" />
            <input
              type="text"
              placeholder="Search furniture, decor..."
              className="w-full pl-10 pr-4 py-2.5 rounded-full
                         bg-white
                         border border-black/10
                         shadow-sm
                         text-sm text-black
                         placeholder-black/50
                         focus:outline-none
                         focus:ring-2 focus:ring-[var(--color-accent)]
                         transition-all"
            />
          </div>
        </div>

        {/* Right - Icons */}
        <div className="flex items-center gap-5">
          <Link href="/cart">
            <button className="relative p-2 rounded-lg bg-black/5 hover:bg-[var(--color-accent)]/10 transition-all">
              <FiShoppingCart className="h-6 w-6 text-black" />
              {activeUser && !cartCountLoading && cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[var(--color-accent)] text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </button>
          </Link>

          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 p-2 rounded-lg bg-black/5 hover:bg-[var(--color-accent)]/10 transition-all"
            >
              <FiUser className="h-6 w-6 text-black" />
              <FiChevronDown
                className={`h-4 w-4 transition-transform ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-lg bg-white shadow-xl border border-black/10">
                {activeUser ? (
                  <>
                    <Link
                      href="/my-profile"
                      className="block px-4 py-3 text-sm hover:bg-black/5"
                    >
                      👤 Profile
                    </Link>
                    <Link
                      href="/my-orders"
                      className="block px-4 py-3 text-sm hover:bg-black/5"
                    >
                      📦 Orders
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-500/10"
                    >
                      🚪 Sign out
                    </button>
                  </>
                ) : (
                  <Link
                    href="/auth/login"
                    className="block px-4 py-3 text-sm hover:bg-black/5"
                  >
                    <RiLoginCircleLine className="inline mr-2" />
                    Login / Register
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {isMobileSearchOpen && (
        <div className="sm:hidden absolute top-16 left-0 w-full px-6 pb-4 bg-[var(--color-secondary)]">
          <input
            type="text"
            placeholder="Search furniture..."
            className="w-full px-4 py-3 rounded-full bg-white border border-black/10 shadow-sm"
          />
        </div>
      )}
    </nav>
  );
};

export default Navbar;
