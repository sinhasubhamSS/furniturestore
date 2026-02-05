"use client";

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

const ImageGallery = () => {
  const { selectedVariant } = useSelector(
    (state: RootState) => state.productDetail,
  );

  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // 🔹 Reset image when variant changes
  useEffect(() => {
    if (selectedVariant?.images?.length) {
      setActiveImage(selectedVariant.images[0].url);
    } else {
      setActiveImage(null);
    }
  }, [selectedVariant]);

  if (!selectedVariant || !selectedVariant.images?.length) {
    return null;
  }

  const images = selectedVariant.images;
  const mainImage = activeImage;

  return (
    <div className="w-full">
      {/* 🔍 Lightbox */}
      {isLightboxOpen && mainImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setIsLightboxOpen(false)}
        >
          <img
            src={mainImage}
            alt="Full View"
            className="max-w-full max-h-[90vh] object-contain cursor-zoom-out"
          />
        </div>
      )}

      {/* Gallery Container */}
      <div className="w-full p-4 lg:p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200 shadow-md">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* ================= Thumbnails – LEFT (Desktop) ================= */}
          <div className="hidden lg:flex w-16 flex-col gap-2 max-h-96 overflow-y-auto bg-white rounded-lg p-1 shadow-inner">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(img.url)}
                className={`border-2 rounded-lg overflow-hidden transition-all ${
                  mainImage === img.url
                    ? "border-[var(--color-accent)] scale-105"
                    : "border-gray-300 hover:border-[var(--color-accent)]"
                }`}
              >
                <img
                  src={img.url}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-14 object-cover"
                />
              </button>
            ))}
          </div>

          {/* ================= Main Image ================= */}
          <div
            className="w-fullh-64 sm:h-80 md:h-[420px] lg:h-[520px] xl:h-[600px] bg-white rounded-xl border border-gray-300 shadow-inner p-2 lg:p-4 flex items-center justify-center overflow-hidden cursor-zoom-in"
            onClick={() => setIsLightboxOpen(true)}
          >
            {mainImage && (
              <img
                src={mainImage}
                alt="Product Image"
                className="max-w-full max-h-full object-contain"
              />
            )}
          </div>

          {/* ================= Thumbnails – BOTTOM (Mobile / Tablet) ================= */}
          <div className="flex lg:hidden gap-3 overflow-x-auto pt-2">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(img.url)}
                className={`min-w-[72px] border-2 rounded-lg overflow-hidden transition-all ${
                  mainImage === img.url
                    ? "border-[var(--color-accent)]"
                    : "border-gray-300"
                }`}
              >
                <img
                  src={img.url}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-16 object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageGallery;
