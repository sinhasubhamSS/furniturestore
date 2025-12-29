"use client";

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

const ImageGallery = () => {
  const { selectedVariant } = useSelector(
    (state: RootState) => state.productDetail
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

  const mainImage = activeImage;

  return (
    <div className="w-full">
      {/* 🔍 Lightbox */}
      {isLightboxOpen && mainImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
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
      <div className="w-full relative p-4 lg:p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200 shadow-md">
        <div className="flex gap-3 lg:gap-4">
          {/* 🔹 Thumbnails */}
          <div className="w-14 lg:w-16 flex flex-col gap-2 max-h-80 lg:max-h-96 overflow-y-auto bg-white rounded-lg p-1 shadow-inner">
            {selectedVariant.images.map((img, idx) => (
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
                  className="w-full h-12 lg:h-14 object-cover"
                />
              </button>
            ))}
          </div>

          {/* 🔹 Main Image */}
          <div className="flex-1">
            <div
              className="w-full h-64 sm:h-80 lg:h-96 bg-white rounded-xl border border-gray-300 shadow-inner p-2 lg:p-4 flex items-center justify-center overflow-hidden cursor-zoom-in"
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageGallery;
