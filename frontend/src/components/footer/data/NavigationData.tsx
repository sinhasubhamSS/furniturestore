import { NavigationSection } from "@/types/footer/footer";

export const navigationData: NavigationSection[] = [
  {
    title: "Shop",
    links: [
      { name: "New Arrivals", url: "/new-arrivals" },
      { name: "Best Sellers", url: "/best-sellers" },
      { name: "Sale Items", url: "/sale" },
      { name: "All Products", url: "/products" },
      { name: "Gift Cards", url: "/gift-cards" },
    ],
  },
  {
    title: "Categories",
    links: [
      { name: "Electronics", url: "/category/electronics" },
      { name: "Fashion", url: "/category/fashion" },
      { name: "Home & Garden", url: "/category/home" },
      { name: "Sports & Fitness", url: "/category/sports" },
      { name: "Books & Media", url: "/category/books" },
    ],
  },
  {
    title: "Account",
    links: [
      { name: "My Orders", url: "/orders" },
      { name: "Track Order", url: "/track" },
      { name: "Wishlist", url: "/wishlist" },
      { name: "Account Settings", url: "/account" },
      { name: "Address Book", url: "/addresses" },
    ],
  },
];
