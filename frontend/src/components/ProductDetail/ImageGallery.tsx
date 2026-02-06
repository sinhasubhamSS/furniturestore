"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { ChevronUp, ChevronDown } from "lucide-react";

const VISIBLE_THUMBS = 4;

const ImageGallery = () => {
  const { selectedVariant } = useSelector(
    (state: RootState) => state.productDetail
  );

  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [startIndex, setStartIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const totalImages = selectedVariant?.images?.length ?? 0;

  /* Reset on variant change */
  useEffect(() => {
    if (selectedVariant?.images?.length) {
      setActiveImage(selectedVariant.images[0].url);
      setStartIndex(0);
    }
  }, [selectedVariant]);

  if (!selectedVariant || !selectedVariant.images?.length) return null;

  const images = selectedVariant.images;
  const visibleImages = images.slice(
    startIndex,
    startIndex + VISIBLE_THUMBS
  );

  const canScrollUp = startIndex > 0;
  const canScrollDown = startIndex + VISIBLE_THUMBS < images.length;

  return (
    <div className="w-full">
      {/* ================= LIGHTBOX ================= */}
      {isLightboxOpen && activeImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          onClick={() => setIsLightboxOpen(false)}
        >
          <img
            src={activeImage}
            alt="Full View"
            className="max-w-[90vw] max-h-[90vh] object-contain cursor-zoom-out"
          />
        </div>
      )}

      {/* ================= DESKTOP GALLERY ================= */}
      <div className="hidden lg:flex gap-4">
        {/* ===== THUMBNAILS COLUMN ===== */}
        <div className="flex flex-col items-center gap-2">
          {/* UP ARROW */}
          {canScrollUp && (
            <button
              onClick={() => setStartIndex((i) => Math.max(i - 1, 0))}
              className="p-1 border rounded-sm bg-white hover:bg-gray-50"
            >
              <ChevronUp size={16} />
            </button>
          )}

          {/* THUMBNAILS */}
          <div className="flex flex-col gap-2">
            {visibleImages.map((img, idx) => (
              <button
                key={idx}
                onMouseEnter={() => setActiveImage(img.url)} // 👈 hover preview
                onClick={() => setActiveImage(img.url)}
                className={`w-14 h-14 border rounded-sm bg-white flex items-center justify-center
                  ${
                    activeImage === img.url
                      ? "border-orange-500"
                      : "border-black/20 hover:border-black/40"
                  }`}
              >
                <img
                  src={img.url}
                  alt={`Thumbnail ${idx + 1}`}
                  className="max-w-full max-h-full object-contain"
                />
              </button>
            ))}
          </div>

          {/* DOWN ARROW */}
          {canScrollDown && (
            <button
              onClick={() =>
                setStartIndex((i) =>
                  Math.min(i + 1, images.length - VISIBLE_THUMBS)
                )
              }
              className="p-1 border rounded-sm bg-white hover:bg-gray-50"
            >
              <ChevronDown size={16} />
            </button>
          )}
        </div>

        {/* ===== MAIN IMAGE ===== */}
        <div
          className="flex-1 bg-white border border-black/10 rounded-sm
                     flex items-center justify-center cursor-zoom-in"
          onClick={() => setIsLightboxOpen(true)}
        >
          <div className="w-full h-[300px] sm:h-[380px] lg:h-[460px] flex items-center justify-center">
            {activeImage && (
              <img
                src={activeImage}
                alt="Product Image"
                className="max-w-full max-h-full object-contain"
              />
            )}
          </div>
        </div>
      </div>

      {/* ================= MOBILE GALLERY ================= */}
      <div className="lg:hidden">
        {/* MAIN IMAGE */}
        <div
          className="bg-white border border-black/10 rounded-sm
                     flex items-center justify-center cursor-zoom-in"
          onClick={() => setIsLightboxOpen(true)}
        >
          <div className="w-full h-[280px] flex items-center justify-center">
            {activeImage && (
              <img
                src={activeImage}
                alt="Product Image"
                className="max-w-full max-h-full object-contain"
              />
            )}
          </div>
        </div>

        {/* THUMBNAILS */}
        <div className="flex gap-3 mt-3 overflow-x-auto">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveImage(img.url)}
              className={`min-w-[64px] h-16 border rounded-sm bg-white
                ${
                  activeImage === img.url
                    ? "border-orange-500"
                    : "border-black/20"
                }`}
            >
              <img
                src={img.url}
                alt={`Thumbnail ${idx + 1}`}
                className="w-full h-full object-contain"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImageGallery;
