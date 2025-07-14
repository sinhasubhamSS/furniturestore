import CategorySection from "@/components/homeComponents/CategorySection";
import HeroSection from "@/components/homeComponents/HeroSection";
import LatestProduct from "@/components/homeComponents/LatestProduct";

// app/(main)/page.tsx
export default function HomePage() {
  return (
    <div>
      <HeroSection />
      <CategorySection />
      <LatestProduct/>
    </div>
  );
  
}
