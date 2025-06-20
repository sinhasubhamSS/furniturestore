"use client";

import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const images = [
  "/products/sofa.jpg",
  "/products/bed.jpg",
  "/products/chair.jpg",
];

const HeroSection = () => {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    loop: true,
    slideChanged(slider) {
      setCurrentSlide(slider.track.details.rel);
    },
    created() {
      startTimer();
    },
  });

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      instanceRef.current?.next();
    }, 4000);
  };

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  useEffect(() => {
    return () => stopTimer();
  }, []);

  return (
    <section className="px-8 py-10 md:py-24">
      <div className="grid grid-cols-1 md:grid-cols-12 lg:grid-cols-10 gap-2 md:gap-6 lg:gap-8 xl:gap-6 max-w-7xl mx-auto items-center">
        {/* Left Text */}
        <div className="md:col-span-6 lg:col-span-5 text-center md:text-left space-y-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[var(--text-accent)] leading-tight">
            Suvidha <br /> Furniture Store
          </h1>
          <p className="text-lg xl:text-xl font-medium text-[var(--foreground)]">
            Quality Furniture For Every Home
          </p>
          <button
            onClick={() => router.push("/products")}
            className="bg-[var(--color-accent)] text-[var(--text-light)] px-6 py-3 rounded-md text-lg font-semibold hover:opacity-90 transition"
          >
            SHOP NOW
          </button>
        </div>

        {/* Right Slider */}
        <div className="md:col-span-6 lg:col-span-5 flex justify-center md:justify-end relative">
          <div
            ref={sliderRef}
            className="keen-slider w-full max-w-xl h-64 sm:h-72 rounded-xl overflow-hidden bg-[var(--color-secondary)]"
            onMouseEnter={stopTimer}
            onMouseLeave={startTimer}
            onTouchStart={stopTimer}
            onTouchEnd={startTimer}
          >
            {images.map((src, i) => (
              <div
                key={i}
                className="keen-slider__slide flex items-center justify-center"
              >
                <img
                  src={src}
                  alt={`Slide ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>

          {/* Slide Indicators */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === currentSlide
                    ? "bg-[var(--color-accent)] w-10"
                    : "bg-gray-400 w-6"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
