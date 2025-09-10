"use client";

import { useGetLatestProductsQuery } from "@/redux/services/user/publicProductApi";
import { homeProduct } from "@/types/Product";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useRef } from "react";

const slideDuration = 6000;

const HeroSection = () => {
  const router = useRouter();
  const { data, isLoading } = useGetLatestProductsQuery();

  // ✅ Use image directly from product (not from variants)
  const products:homeProduct[] = data || [];

  const images = products.map((product) => product?.image).filter(Boolean);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const pauseTimeRef = useRef<number | null>(null);
  const accumulatedTimeRef = useRef(0);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setProgress(0);
    accumulatedTimeRef.current = 0;
  }, [images.length]);

  const animateProgress = useCallback(
    (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed =
        timestamp - startTimeRef.current + accumulatedTimeRef.current;
      const percent = Math.min(100, (elapsed / slideDuration) * 100);
      setProgress(percent);

      if (percent >= 100) {
        nextSlide();
        startTimeRef.current = timestamp;
        accumulatedTimeRef.current = 0;
      }

      animationRef.current = requestAnimationFrame(animateProgress);
    },
    [nextSlide]
  );

  const startAnimation = useCallback(() => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    if (pauseTimeRef.current) {
      accumulatedTimeRef.current += performance.now() - pauseTimeRef.current;
      pauseTimeRef.current = null;
    }
    animationRef.current = requestAnimationFrame(animateProgress);
  }, [animateProgress]);

  const pauseAnimation = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    pauseTimeRef.current = performance.now();
  };

  useEffect(() => {
    if (!isPaused && images.length > 0) startAnimation();
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPaused, images.length, startAnimation]);

  const handlePause = () => {
    setIsPaused(true);
    pauseAnimation();
  };

  const handleResume = () => {
    setIsPaused(false);
    startAnimation();
  };

  return (
    <section className="bg-[var(--color-primary)] text-[var(--color-foreground)] transition-colors duration-300">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10 w-full mx-auto items-center">
        {/* Left - Text */}
        <div className="col-span-1 md:col-span-5 text-center md:text-left space-y-6">
          <h1 className="text-4xl sm:text-5xl xl:text-6xl font-bold text-[var(--text-accent)] leading-tight tracking-tight">
            Suvidha <br className="md:hidden" /> Furniture Store
          </h1>
          <p className="text-lg sm:text-xl font-medium max-w-md mx-auto md:mx-0 text-[var(--color-foreground)]">
            Quality Furniture For Every Home – Durable. Stylish. Affordable.
          </p>
          <div className="flex justify-center md:justify-start">
            <button
              onClick={() => router.push("/products")}
              className="bg-[var(--color-accent)] text-[var(--text-light)] px-8 py-3 rounded-2xl text-lg font-semibold shadow-xl hover:scale-105 transition-transform"
            >
              🛒 SHOP NOW
            </button>
          </div>
        </div>

        {/* Right - Image Slider */}
        <div className="col-span-1 md:col-span-7 relative flex justify-center md:justify-end my-8">
          <div
            className="relative w-full max-w-2xl aspect-[3/2] rounded-3xl overflow-hidden bg-[var(--color-secondary)] shadow-2xl border border-[var(--color-border)]"
            onMouseEnter={handlePause}
            onMouseLeave={handleResume}
            onTouchStart={handlePause}
            onTouchEnd={handleResume}
          >
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <span className="text-[var(--color-foreground)]">
                  Loading latest products...
                </span>
              </div>
            ) : images.length === 0 ? (
              <div className="flex items-center justify-center h-full px-4 text-center">
                <span className="text-[var(--color-foreground)]">
                  No product images available.
                </span>
              </div>
            ) : (
              images.map((src, index) => (
                <img
                  key={index}
                  src={src}
                  alt={`Slide ${index + 1}`}
                  className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-700 ease-in-out ${
                    index === currentIndex ? "opacity-100" : "opacity-0"
                  }`}
                />
              ))
            )}
          </div>

          {/* Progress Bars */}
          {images.length > 0 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 w-full justify-center px-4">
              {images.map((_, index) => (
                <div
                  key={index}
                  className="h-1.5 flex-1 max-w-[80px] bg-[var(--color-secondary)] rounded-full overflow-hidden"
                >
                  {index === currentIndex && (
                    <div
                      className="h-full bg-[var(--color-accent)] rounded-full"
                      style={{
                        width: `${progress}%`,
                        transition: isPaused
                          ? "none"
                          : "width 0.1s linear, transform 0.2s ease",
                        transform:
                          progress > 0 && progress < 100
                            ? "scaleY(1.4)"
                            : "scaleY(1)",
                        transformOrigin: "center",
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
