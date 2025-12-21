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
import type { homeProduct } from "@/types/Product";

const SLIDE_DURATION = 6000;

type SlideSrc = { id: string; src: string | StaticImageData };

const isStaticImageData = (v: unknown): v is StaticImageData =>
  typeof v === "object" && v !== null && "src" in (v as any);

const buildSlides = (products: homeProduct[] | undefined): SlideSrc[] => {
  if (!products || products.length === 0) return [];

  const slides: SlideSrc[] = [];

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const raw = p?.image;
    if (!raw) continue;

    if (typeof raw === "string") {
      const s = raw.trim();
      if (!s) continue;
      slides.push({ id: p._id ?? `idx-${i}`, src: s });
    } else if (isStaticImageData(raw)) {
      slides.push({ id: p._id ?? `idx-${i}`, src: raw });
    }
  }

  return slides;
};

type Props = {
  products?: homeProduct[];
  isLoading?: boolean;
};

const HeroSection: React.FC<Props> = ({ products = [], isLoading = false }) => {
  const router = useRouter();
  const slides = useMemo(() => buildSlides(products), [products]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const pauseTimeRef = useRef<number | null>(null);
  const accumulatedTimeRef = useRef(0);

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

  return (
    <section className="bg-[var(--color-primary)] mt-2">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
        {/* LEFT TEXT — unchanged */}
        <div className="md:col-span-5 text-center md:text-left space-y-6">
          <h1 className="text-4xl sm:text-5xl xl:text-6xl font-bold text-[var(--text-accent)]">
            Suvidha <br className="md:hidden" /> Furniture Store
          </h1>
          <p className="text-lg sm:text-xl max-w-md">
            Quality Furniture For Every Home – Durable. Stylish. Affordable.
          </p>
          <button
            onClick={() => router.push("/products")}
            className="bg-[var(--color-accent)] text-white px-8 py-3 rounded-2xl text-lg font-semibold shadow-xl hover:scale-105"
          >
            🛒 SHOP NOW
          </button>
        </div>

        {/* RIGHT SLIDER — unchanged */}
        <div className="md:col-span-7 relative">
          <div
            className="relative w-full max-w-2xl aspect-[3/2] rounded-3xl overflow-hidden bg-[var(--color-secondary)] shadow-2xl mt-2"
            onMouseEnter={() => {
              setIsPaused(true);
              pauseAnimation();
            }}
            onMouseLeave={() => {
              setIsPaused(false);
              startAnimation();
            }}
          >
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                Loading latest products…
              </div>
            ) : slides.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                No product images available.
              </div>
            ) : (
              slides.map((slide, index) => (
                <div
                  key={slide.id}
                  className={`absolute inset-0 transition-opacity duration-700 ${
                    index === currentIndex ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <Image
                    src={slide.src}
                    alt={`Slide ${index + 1}`}
                    fill
                    priority={index === 0}
                    sizes="(max-width: 768px) 100vw,
         (max-width: 1024px) 70vw,
         600px"
                    style={{ objectFit: "contain" }}
                  />
                </div>
              ))
            )}
          </div>

          {/* Progress bars — unchanged */}
          {slides.length > 0 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 w-full justify-center px-4">
              {slides.map((_, i) => (
                <div
                  key={i}
                  className="h-1.5 flex-1 max-w-[80px] bg-[var(--color-secondary)] rounded-full"
                >
                  {i === currentIndex && (
                    <div
                      className="h-full bg-[var(--color-accent)]"
                      style={{ width: `${progress}%` }}
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
