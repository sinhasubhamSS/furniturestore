"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { FiChevronRight } from "react-icons/fi";
import { MdChevronLeft, MdChevronRight as MdChevronOpen } from "react-icons/md";
import { navItems } from "@/app/config/nav.config";

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

  const isActive = (href: string) => pathname === href;

  const [expandedMenus, setExpandedMenus] = useState<ExpandedMenus>({});

  // Set activeMenu & expand corresponding parent on mount
  useEffect(() => {
    let found = false;

    for (const item of navItems) {
      if (item.children) {
        for (const child of item.children) {
          if (pathname === child.href) {
            setExpandedMenus((prev) => ({ ...prev, [item.name]: true }));
            found = true;
            break;
          }
        }
      } else if (pathname === item.href) {
        found = true;
      }

      if (found) break;
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
      {isOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden"
          onClick={toggle}
        />
      )}

      {!isOpen && (
        <button
          onClick={toggle}
          className="fixed left-0 top-1/2 z-40 p-2 bg-[var(--color-accent)] text-white rounded-r-lg shadow-lg transform -translate-y-1/2 hover:scale-[1.05] transition-transform duration-200 ease-in-out"
        >
          <MdChevronOpen size={24} />
        </button>
      )}

      <aside
        className={`fixed top-0 bottom-0 z-50 w-64 bg-[var(--color-secondary)] text-[var(--foreground)] transition-all duration-300 ${
          isOpen ? "left-0" : "-left-full"
        }`}
      >
        <div className="flex flex-col h-full p-4">
          {/* Header */}
          <div className="flex justify-between items-center mb-8 p-2">
            <h2 className="text-xl font-bold text-[var(--color-accent)]">
              Admin Panel
            </h2>
            <button
              onClick={toggle}
              className="text-[var(--foreground)] hover:text-[var(--color-accent)]"
            >
              <MdChevronLeft size={24} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const isExpanded = expandedMenus[item.name];
                const Icon = item.icon;

                if (item.children) {
                  return (
                    <li key={item.name}>
                      <button
                        onClick={() => toggleMenu(item.name)}
                        className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                          isExpanded
                            ? "bg-[var(--color-accent-light)] text-[var(--color-accent)]"
                            : "hover:bg-[var(--color-accent-light)] hover:text-[var(--color-accent)]"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon size={20} />
                          <span>{item.label}</span>
                        </div>
                        <FiChevronRight
                          className={`transition-transform ${
                            isExpanded ? "rotate-90" : ""
                          }`}
                        />
                      </button>

                      <ul
                        className={`ml-6 mt-1 space-y-1 transition-all duration-300 ease-in-out overflow-hidden ${
                          isExpanded ? "max-h-96" : "max-h-0"
                        }`}
                      >
                        {item.children.map((child) => (
                          <li key={child.name}>
                            <button
                              onClick={() => router.push(child.href)}
                              className={`w-full text-left p-2 rounded transition-colors ${
                                pathname === child.href
                                  ? "bg-[var(--color-accent)] text-white"
                                  : "hover:bg-[var(--color-accent-light)] hover:text-[var(--color-accent)]"
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
                      onClick={() => router.push(item.href!)}
                      className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                        pathname === item.href
                          ? "bg-[var(--color-accent)] text-white"
                          : "hover:bg-[var(--color-accent-light)] hover:text-[var(--color-accent)]"
                      }`}
                    >
                      <Icon size={20} />
                      <span>{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="border-t border-[var(--color-accent)] pt-3 mt-4">
            <div className="flex items-center space-x-3 p-3">
              <div className="w-8 h-8 rounded-full bg-[var(--color-accent)] flex items-center justify-center text-white text-sm">
                JD
              </div>
              <span className="font-medium">John Doe</span>
            </div>
            <button className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-[var(--color-accent-light)] hover:text-[var(--color-accent)] transition-colors">
              <FiChevronRight size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
