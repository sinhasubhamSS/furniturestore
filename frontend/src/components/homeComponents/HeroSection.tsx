"use client";

import Image, { type StaticImageData } from "next/image";
import { useRouter } from "next/navigation";
import React, {
  useMemo,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useGetLatestProductsQuery } from "@/redux/services/user/publicProductApi";
import type { homeProduct } from "@/types/Product";

const SLIDE_DURATION = 6000;

type SlideSrc = { id: string; src: string | StaticImageData };

const isStaticImageData = (v: unknown): v is StaticImageData =>
  typeof v === "object" && v !== null && "src" in (v as any);

/**
 * Build normalized slides (string URLs or StaticImageData) with stable ids.
 */
const buildSlides = (products: homeProduct[] | undefined): SlideSrc[] => {
  if (!products || products.length === 0) return [];

  const slides: SlideSrc[] = [];

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const raw = p?.image;

    if (!raw) continue;

    if (typeof raw === "string") {
      const s = raw.trim();
      if (s.length === 0) continue;
      slides.push({ id: p._id ?? `idx-${i}`, src: s });
    } else if (isStaticImageData(raw)) {
      slides.push({ id: p._id ?? `idx-${i}`, src: raw });
    }
  }

  return slides;
};

const HeroSection: React.FC = () => {
  const router = useRouter();
  const { data, isLoading } = useGetLatestProductsQuery();

  const products: homeProduct[] = data ?? [];

  const slides = useMemo(() => buildSlides(products), [products]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const pauseTimeRef = useRef<number | null>(null);
  const accumulatedTimeRef = useRef(0);

  // reset index when slides change so we never go out-of-range
  useEffect(() => {
    setCurrentIndex((prev) =>
      slides.length === 0 ? 0 : Math.min(prev, slides.length - 1)
    );
    setProgress(0);
    accumulatedTimeRef.current = 0;
    startTimeRef.current = null;
  }, [slides.length]);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) =>
      slides.length > 0 ? (prev + 1) % slides.length : 0
    );
    setProgress(0);
    accumulatedTimeRef.current = 0;
    startTimeRef.current = null;
  }, [slides.length]);

  const animateProgress = useCallback(
    (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed =
        timestamp - startTimeRef.current + accumulatedTimeRef.current;
      const percent = Math.min(100, (elapsed / SLIDE_DURATION) * 100);
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

  const pauseAnimation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    pauseTimeRef.current = performance.now();
  }, []);

  useEffect(() => {
    if (slides.length === 0) return;
    if (!isPaused) startAnimation();
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPaused, slides.length, startAnimation]);

  const handlePause = () => {
    setIsPaused(true);
    pauseAnimation();
  };

  const handleResume = () => {
    setIsPaused(false);
    startAnimation();
  };

  return (
    <section className="bg-[var(--color-primary)] text-[var(--color-foreground)] transition-colors duration-300 mt-2">
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
            ) : slides.length === 0 ? (
              <div className="flex items-center justify-center h-full px-4 text-center">
                <span className="text-[var(--color-foreground)]">
                  No product images available.
                </span>
              </div>
            ) : (
              slides.map((slide, index) => {
                const active = index === currentIndex;
                return (
                  <div
                    key={slide.id}
                    className={`absolute inset-0 transition-opacity duration-700 ease-in-out p-2 ${
                      active ? "opacity-100 z-10" : "opacity-0 z-0"
                    }`}
                    aria-hidden={!active}
                  >
                    <Image
                      src={slide.src}
                      alt={`Slide ${index + 1}`}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      priority={index === 0}
                      loading={index === 0 ? "eager" : "lazy"}
                      style={{ objectFit: "contain" }}
                    />
                  </div>
                );
              })
            )}
          </div>

          {/* Progress Bars */}
          {slides.length > 0 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 w-full justify-center px-4">
              {slides.map((_, index) => (
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
