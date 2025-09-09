import { NavigationSection } from "@/types/footer/footer";

export const navigationData: NavigationSection[] = [
  {
    title: "Shop",
    links: [
      { name: "New Arrivals", url: "/new-arrivals" },
      { name: "All Products", url: "/products" },
    
    ],
  },

  {
    title: "Account",
    links: [
      { name: "My Orders", url: "/my-orders" },
      { name: "Wishlist", url: "/wishlist" },
      { name: "Address Book", url: "/addresses" },
    ],
  },
];
