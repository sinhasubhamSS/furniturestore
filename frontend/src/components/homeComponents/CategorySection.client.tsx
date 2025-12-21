"use client";

import React, { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CategoryCard from "../helperComponents/CategoryCard";

type Category = {
  _id: string;
  name: string;
  slug: string;
  image: {
    url: string;
    public_id: string;
  };
};

type Props = {
  categories: Category[];
};

export default function CategorySectionClient({ categories }: Props) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const update = () => {
      setCanScrollLeft(el.scrollLeft > 0);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth);
    };

    update();
    el.addEventListener("scroll", update);
    window.addEventListener("resize", update);

    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({
      left: dir === "left" ? -240 : 240,
      behavior: "smooth",
    });
  };

  if (!categories || categories.length === 0) return null;

  return (
    <section className="relative mt-10 w-full bg-[var(--color-secondary)] rounded-2xl py-6 px-6 md:px-12 overflow-hidden max-h-[220px]">
      {/* background glow */}
      <div className="absolute -top-16 -left-28 w-[280px] h-[280px] bg-[var(--color-accent)] rounded-full opacity-20 blur-3xl" />
      <div className="absolute -bottom-16 -right-24 w-[320px] h-[320px] bg-[var(--color-accent)] rounded-full opacity-15 blur-3xl" />

      <div className="max-w-[1440px] mx-auto relative z-10">
        <h2 className="text-3xl font-extrabold text-center mb-8 border-b-4 border-[var(--color-accent)] w-max mx-auto pb-2">
          Explore Categories
        </h2>

        <div className="relative">
          {canScrollLeft && (
            <button
              onClick={() => scroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-[var(--color-accent)] text-white rounded-full p-3 shadow-md"
            >
              ←
            </button>
          )}

          {canScrollRight && (
            <button
              onClick={() => scroll("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-[var(--color-accent)] text-white rounded-full p-3 shadow-md"
            >
              →
            </button>
          )}

          <div
            ref={scrollRef}
            className="flex gap-5 overflow-x-auto scroll-smooth scrollbar-hide h-[130px] py-2"
          >
            {categories.map((cat) => (
              <div
                key={cat._id}
                className="min-w-[140px] max-w-[160px] flex-shrink-0"
              >
                <CategoryCard
                  category={cat}
                  isCompact
                  onClick={() => router.push(`/products?category=${cat.slug}`)}
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
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}
