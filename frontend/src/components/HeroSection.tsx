"use client";

import useLatestProducts from "@/hooks/useLatestProduct";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useRef } from "react";

const slideDuration = 6000;

const HeroSection = () => {
  const router = useRouter();
  const { product: products, loading: loading } = useLatestProducts();
  const images = products?.map((product) => product.images?.[0]) || [];

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

  if (loading || images.length === 0) {
    return <div className="text-center py-10">Loading latest products...</div>;
  }

  return (
    <section className="px-4 sm:px-8 py-6 md:py-12">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 max-w-7xl mx-auto items-center">
        {/* Left - Text */}
        <div className="col-span-1 md:col-span-5 text-center md:text-left space-y-4">
          <h1 className="text-4xl sm:text-5xl lg:text-[2.75rem] xl:text-[3.25rem] font-extrabold text-[var(--text-accent)] leading-tight">
            Suvidha <br className="md:hidden" /> Furniture Store
          </h1>
          <p className="text-base sm:text-lg xl:text-xl font-medium text-[var(--foreground)]">
            Quality Furniture For Every Home
          </p>
          <div className="flex justify-center md:justify-start">
            <button
              onClick={() => router.push("/products")}
              className="bg-[var(--color-accent)] text-[var(--text-light)] px-10 py-4 rounded-xl text-lg sm:text-xl font-semibold shadow-md hover:scale-105 hover:shadow-lg transition-all duration-300 ease-in-out"
            >
              🛒 SHOP NOW
            </button>
          </div>
        </div>

        {/* Right - Image Slider */}
        <div className="col-span-1 md:col-span-7 flex justify-center md:justify-end relative">
          <div
            className="relative w-full max-w-xl h-72 sm:h-80 md:h-88 lg:h-96 xl:h-104 2xl:h-112 rounded-xl overflow-hidden bg-[var(--color-secondary)]"
            onMouseEnter={handlePause}
            onMouseLeave={handleResume}
            onTouchStart={handlePause}
            onTouchEnd={handleResume}
          >
            {images.map((src, index) => (
              <img
                key={index}
                src={src}
                alt={`Slide ${index + 1}`}
                className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-700 ease-in-out ${
                  index === currentIndex ? "opacity-100" : "opacity-0"
                }`}
              />
            ))}
          </div>

          {/* Progress Bars */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, index) => (
              <div
                key={index}
                className="h-1.5 w-10 bg-gray-300 rounded-full overflow-hidden"
              >
                {index === currentIndex && (
                  <div
                    className="h-full bg-[var(--color-accent)] rounded-full"
                    style={{
                      width: `${progress}%`,
                      transform:
                        progress > 0 && progress < 100
                          ? "scaleY(1.5)"
                          : "scaleY(1)",
                      transition: isPaused
                        ? "none"
                        : "width 0.1s linear, transform 0.3s ease-in-out",
                      transformOrigin: "center",
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
