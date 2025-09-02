"use client";

import React, { useRef, useState, useEffect } from "react";
import { useRouter } from 'next/navigation'; // ✅ Add this import
import { useGetCategoriesQuery } from "@/redux/services/admin/adminCategoryapi";
import CategoryCard from "../helperComponents/CategoryCard";

type Props = {
  onSelect?: (categoryId: string) => void;
};

const CategorySection = ({ onSelect }: Props) => {
  const { data: categories, isLoading, error } = useGetCategoriesQuery();
  const router = useRouter(); // ✅ Add router
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const checkScroll = () => {
      setCanScrollLeft(el.scrollLeft > 0);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth);
    };

    checkScroll();
    el.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);

    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [categories]);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollAmount = 240;
    if (direction === "left") {
      el.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    } else {
      el.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  // ✅ NEW: Category click handler
  const handleCategoryClick = (category: any) => {
    // Navigate to products page with category filter
    router.push(`/products?category=${category.slug}`);
    
    // Optional: Also call the parent callback if provided
    onSelect?.(category._id);
  };

  if (isLoading)
    return (
      <p className="text-[var(--color-foreground)] text-center py-10 font-medium">
        Loading categories...
      </p>
    );
  if (error)
    return (
      <p className="text-red-500 text-center py-10 font-semibold">
        Failed to load categories
      </p>
    );
  if (!categories || categories.length === 0)
    return <p className="text-center py-10">No categories found.</p>;

  return (
    <section className="relative mt-10 w-full bg-[var(--color-secondary)] rounded-2xl py-6 px-6 md:px-12 overflow-hidden max-h-[220px]">
      {/* Subtle blurred accent circles */}
      <div className="absolute -top-16 -left-28 w-[280px] h-[280px] bg-[var(--color-accent)] rounded-full opacity-20 blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-16 -right-24 w-[320px] h-[320px] bg-[var(--color-accent)] rounded-full opacity-15 blur-3xl pointer-events-none"></div>

      <div className="max-w-[1440px] mx-auto relative z-10 h-full flex flex-col">
        <h2 className="text-3xl font-extrabold text-center text-[var(--color-foreground)] mb-8 select-none border-b-4 border-[var(--color-accent)] w-max mx-auto pb-2">
          Explore Categories
        </h2>

        <div className="relative flex-1">
          {canScrollLeft && (
            <button
              onClick={() => scroll("left")}
              aria-label="Scroll categories left"
              className="absolute top-1/2 left-0 -translate-y-1/2 bg-[var(--color-accent)] text-white rounded-full p-3 shadow-md z-20 hover:bg-[var(--color-accent)]/90 transition-colors"
            >
              &#8592;
            </button>
          )}
          {canScrollRight && (
            <button
              onClick={() => scroll("right")}
              aria-label="Scroll categories right"
              className="absolute top-1/2 right-0 -translate-y-1/2 bg-[var(--color-accent)] text-white rounded-full p-3 shadow-md z-20 hover:bg-[var(--color-accent)]/90 transition-colors"
            >
              &#8594;
            </button>
          )}

          <div
            ref={scrollRef}
            className="flex gap-5 overflow-x-auto scrollbar-hide scroll-smooth h-[120px] md:h-[140px] py-2"
          >
            {categories.map((category) => (
              <div
                key={category._id}
                className="min-w-[140px] max-w-[160px] flex-shrink-0 h-full"
              >
                <CategoryCard
                  category={category}
                  onClick={() => handleCategoryClick(category)} // ✅ Updated click handler
                  isCompact={true}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
};

export default CategorySection;
