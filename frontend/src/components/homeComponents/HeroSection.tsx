"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";

const images = [
  "/hero/bedhero1.png",
  "/hero/sofahero.png",
  "/hero/sofaheroroyal.jpg",
];

const SLIDE_DURATION = 6000;

const HeroSection = () => {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startAutoSlide = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, SLIDE_DURATION);
  };

  useEffect(() => {
    startAutoSlide();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % images.length);
    startAutoSlide();
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    startAutoSlide();
  };

  return (
    <section className="relative w-full h-[70svh] md:h-[100svh] min-h-[500px] overflow-hidden group">
      {" "}
      {/* Slides */}
      {images.map((img, index) => (
        <div
          key={index}
          className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out ${
            index === current ? "opacity-100 scale-100" : "opacity-0 scale-105"
          }`}
          style={{ backgroundImage: `url(${img})` }}
        />
      ))}
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/20" />
      {/* Arrows (Desktop Only) */}
      <button
        onClick={prevSlide}
        className="hidden lg:flex absolute left-8 top-1/2 -translate-y-1/2 
                   w-14 h-14 items-center justify-center
                   opacity-0 group-hover:opacity-100
                   transition-all duration-300
                   text-white text-4xl font-light
                   z-30
                   hover:scale-110 
                   hover:drop-shadow-[0_0_20px_rgba(255,255,255,0.6)]"
      >
        ‹
      </button>
      <button
        onClick={nextSlide}
        className="hidden lg:flex absolute right-8 top-1/2 -translate-y-1/2 
                   w-14 h-14 items-center justify-center
                   opacity-0 group-hover:opacity-100
                   transition-all duration-300
                   text-white text-4xl font-light
                   z-30
                   hover:scale-110 
                   hover:drop-shadow-[0_0_20px_rgba(255,255,255,0.6)]"
      >
        ›
      </button>
      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <div className="max-w-2xl text-white space-y-6 sm:space-y-8">
            {/* Heading */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
              Premium Wooden Furniture <br />
              For Modern Homes
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg md:text-xl opacity-90">
              Crafted with precision. Designed for elegance. Built to elevate
              your living experience.
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 pt-2">
              {/* Primary CTA */}
              <button
                onClick={() => router.push("/products")}
                className="bg-[var(--color-accent)]
                           hover:bg-white hover:text-black
                           transition-all duration-300
                           text-white
                           px-6 py-3
                           sm:px-8 sm:py-3
                           md:px-10 md:py-4
                           rounded-full
                           text-base sm:text-lg md:text-xl
                           font-semibold
                           shadow-2xl
                           hover:scale-105
                           active:scale-95"
              >
                Explore Collection
              </button>

              {/* Secondary CTA */}
              <button
                onClick={() => router.push("/products")}
                className="border border-white text-white
                           hover:bg-white hover:text-black
                           transition-all duration-300
                           px-6 py-3
                           sm:px-8 sm:py-3
                           md:px-10 md:py-4
                           rounded-full
                           text-base sm:text-lg md:text-xl
                           font-semibold
                           hover:scale-105
                           active:scale-95"
              >
                Shop Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
