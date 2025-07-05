"use client";

import { useState, useEffect } from "react";
import {
  FiHome,
  FiUsers,
  FiSettings,
  FiFileText,
  FiPieChart,
  FiShoppingBag,
  FiLogOut,
  FiChevronRight,
} from "react-icons/fi";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";

type SidebarProps = {
  isOpen: boolean;
  toggle: () => void;
  isMobile: boolean;
};

type ExpandedMenus = {
  products: boolean;
  users: boolean;
  content: boolean;
  [key: string]: boolean;
};

export default function Sidebar({ isOpen, toggle, isMobile }: SidebarProps) {
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [expandedMenus, setExpandedMenus] = useState<ExpandedMenus>({
    products: false,
    users: false,
    content: false,
  });

  const toggleMenu = (menu: keyof ExpandedMenus) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }));
  };

  const navItems = [
    {
      name: "dashboard",
      icon: <FiHome size={20} />,
      label: "Dashboard",
      subItems: [],
    },
    {
      name: "products",
      icon: <FiShoppingBag size={20} />,
      label: "Products",
      subItems: [
        { name: "all-products", label: "All Products" },
        { name: "categories", label: "Categories" },
        { name: "inventory", label: "Inventory" },
      ],
    },
    {
      name: "users",
      icon: <FiUsers size={20} />,
      label: "Users",
      subItems: [
        { name: "all-users", label: "All Users" },
        { name: "roles", label: "User Roles" },
        { name: "permissions", label: "Permissions" },
      ],
    },
    {
      name: "reports",
      icon: <FiPieChart size={20} />,
      label: "Reports",
      subItems: [],
    },
    {
      name: "content",
      icon: <FiFileText size={20} />,
      label: "Content",
      subItems: [
        { name: "pages", label: "Pages" },
        { name: "posts", label: "Blog Posts" },
        { name: "media", label: "Media Library" },
      ],
    },
    {
      name: "settings",
      icon: <FiSettings size={20} />,
      label: "Settings",
      subItems: [],
    },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden"
          onClick={toggle}
        />
      )}

      {/* Collapsed toggle button */}
      {!isOpen && (
        <button
          onClick={toggle}
          className="fixed left-0 top-1/2 z-40 p-2 bg-[var(--color-accent)] text-white rounded-r-lg shadow-lg transform -translate-y-1/2 hover:bg-[var(--color-accent-dark)] transition-all"
        >
          <MdChevronRight size={24} />
        </button>
      )}

      <aside
        className={`fixed top-0 bottom-0 z-50 w-64 bg-[var(--color-secondary)] text-[var(--foreground)] border-r border-[var(--color-accent)] transition-all duration-300 ${
          isOpen ? "left-0" : "-left-full"
        }`}
      >
        <div className="flex flex-col h-full p-4">
          {/* Sidebar header */}
          <div className="flex justify-between items-center mb-8 p-2">
            <h2 className="text-xl font-bold text-[var(--color-accent)]">
              Admin Panel
            </h2>
            <button
              onClick={toggle}
              className="text-2xl text-[var(--foreground)] hover:text-[var(--color-accent)] transition-colors"
            >
              <MdChevronLeft size={24} />
            </button>
          </div>

          {/* Navigation items */}
          <nav className="flex-1">
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.name}>
                  {item.subItems.length > 0 ? (
                    <>
                      <button
                        onClick={() =>
                          toggleMenu(item.name as keyof ExpandedMenus)
                        }
                        className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                          activeMenu.startsWith(item.name)
                            ? "bg-[var(--color-accent)] text-white"
                            : "hover:bg-[var(--color-accent-light)] hover:text-[var(--color-accent)]"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span>{item.icon}</span>
                          <span>{item.label}</span>
                        </div>
                        <FiChevronRight
                          className={`transition-transform ${
                            expandedMenus[item.name as keyof ExpandedMenus]
                              ? "rotate-90"
                              : ""
                          }`}
                        />
                      </button>
                      {expandedMenus[item.name as keyof ExpandedMenus] && (
                        <ul className="ml-8 mt-1 space-y-1">
                          {item.subItems.map((subItem) => (
                            <li key={subItem.name}>
                              <button
                                onClick={() => setActiveMenu(subItem.name)}
                                className={`w-full text-left p-2 rounded transition-colors ${
                                  activeMenu === subItem.name
                                    ? "bg-[var(--color-accent)] text-white"
                                    : "hover:bg-[var(--color-accent-light)] hover:text-[var(--color-accent)]"
                                }`}
                              >
                                {subItem.label}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  ) : (
                    <button
                      onClick={() => setActiveMenu(item.name)}
                      className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                        activeMenu === item.name
                          ? "bg-[var(--color-accent)] text-white"
                          : "hover:bg-[var(--color-accent-light)] hover:text-[var(--color-accent)]"
                      }`}
                    >
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* User profile and logout */}
          <div className="border-t border-[var(--color-accent)] pt-3">
            <div className="flex items-center space-x-3 p-3">
              <div className="w-8 h-8 rounded-full bg-[var(--color-accent)] flex items-center justify-center text-white text-sm">
                JD
              </div>
              <span className="font-medium">John Doe</span>
            </div>
            <button className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-[var(--color-accent-light)] hover:text-[var(--color-accent)] transition-colors">
              <FiLogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
