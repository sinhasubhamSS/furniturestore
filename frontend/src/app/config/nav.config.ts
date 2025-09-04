import {
  FiHome,
  FiUsers,
  FiSettings,
  FiFileText,
  FiShoppingBag,
} from "react-icons/fi";

export const navItems = [
  {
    name: "dashboard",
    label: "Dashboard",
    icon: FiHome,
    href: "/admin/dashboard",
  },
  {
    name: "products",
    label: "Products",
    icon: FiShoppingBag,
    children: [
      { name: "all-products", label: "All Products", href: "/admin/products" },
      {
        name: "categories",
        label: "Categories",
        href: "/admin/products/categories",
      },
    ],
  },
  {
    name: "orders",
    label: "Orders",
    icon: FiFileText,
    children: [
      { name: "all-orders", label: "All Orders",href: "/admin/orders" },
      { name: "returns", label: "Returns", href: "/admin/orders/returns" },
    ],
  },
  {
    name: "users",
    label: "Users",
    icon: FiUsers,
    children: [
      { name: "all-users", label: "All Users", href: "/admin/users" },
      { name: "roles", label: "Roles", href: "/admin/users/roles" },
    ],
  },
  {
    name: "settings",
    label: "Settings",
    icon: FiSettings,
    href: "/admin/settings",
  },
];
