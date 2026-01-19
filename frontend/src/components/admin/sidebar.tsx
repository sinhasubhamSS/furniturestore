"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { FiChevronRight } from "react-icons/fi";
import { MdChevronLeft, MdChevronRight as MdChevronOpen } from "react-icons/md";
import { navItems } from "@/app/config/nav.config";
import Link from "next/link";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";

type SidebarProps = {
  isOpen: boolean;
  toggle: () => void;
  isMobile: boolean;
};

type ExpandedMenus = {
  [key: string]: boolean;
};

export default function Sidebar({ isOpen, toggle, isMobile }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useSelector((state: RootState) => state.user.activeUser);

  const [expandedMenus, setExpandedMenus] = useState<ExpandedMenus>({});

  useEffect(() => {
    for (const item of navItems) {
      if (item.children) {
        for (const child of item.children) {
          if (pathname === child.href) {
            setExpandedMenus({ [item.name]: true });
            return;
          }
        }
      }
    }
  }, [pathname]);

  const toggleMenu = (menu: string) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }));
  };

  return (
    <>
      {/* Mobile open button */}
      {!isOpen && isMobile && (
        <button
          onClick={toggle}
          className="fixed left-0 top-1/2 z-40 p-2 bg-[var(--color-accent)] text-white rounded-r-lg shadow-lg -translate-y-1/2 cursor-pointer"
        >
          <MdChevronOpen size={24} />
        </button>
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 bottom-0 z-50
          bg-[var(--color-secondary)] text-[var(--foreground)]
          transform transition-transform duration-300 ease-in-out
          pointer-events-auto cursor-default
          ${isMobile ? "w-screen" : "w-64"}
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex flex-col h-full p-4">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <Link href="/" className="cursor-pointer">
              <h2 className="text-xl font-bold text-[var(--color-accent)]">
                Suvidha
              </h2>
            </Link>
            <button onClick={toggle} className="cursor-pointer">
              <MdChevronLeft size={24} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isExpanded = expandedMenus[item.name];

                if (item.children) {
                  return (
                    <li key={item.name}>
                      <button
                        onClick={() => toggleMenu(item.name)}
                        className="w-full flex justify-between items-center p-3 rounded-lg
                                   cursor-pointer hover:bg-[var(--color-accent-light)]"
                      >
                        <div className="flex items-center gap-3">
                          <Icon size={20} />
                          {item.label}
                        </div>
                        <FiChevronRight
                          className={`transition-transform ${
                            isExpanded ? "rotate-90" : ""
                          }`}
                        />
                      </button>

                      <ul
                        className={`ml-6 mt-1 overflow-hidden transition-all duration-300 ${
                          isExpanded ? "max-h-96" : "max-h-0"
                        }`}
                      >
                        {item.children.map((child) => (
                          <li key={child.name}>
                            <button
                              onClick={() => {
                                router.push(child.href);
                                if (isMobile) toggle();
                              }}
                              className={`w-full text-left p-2 rounded
                                          cursor-pointer
                                          ${
                                            pathname === child.href
                                              ? "bg-[var(--color-accent)] text-white"
                                              : "hover:bg-[var(--color-accent-light)]"
                                          }`}
                            >
                              {child.label}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </li>
                  );
                }

                return (
                  <li key={item.name}>
                    <button
                      onClick={() => {
                        router.push(item.href!);
                        if (isMobile) toggle();
                      }}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg
                                  cursor-pointer
                                  ${
                                    pathname === item.href
                                      ? "bg-[var(--color-accent)] text-white"
                                      : "hover:bg-[var(--color-accent-light)]"
                                  }`}
                    >
                      <Icon size={20} />
                      {item.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="border-t pt-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-[var(--color-accent)] flex items-center justify-center text-white text-sm">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : "AD"}
              </div>
              <span>{user?.name || "Admin"}</span>
            </div>

            <button className="w-full text-left p-3 rounded-lg cursor-pointer hover:bg-[var(--color-accent-light)]">
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
