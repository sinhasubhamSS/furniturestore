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

  /* Reset image when variant changes */
  useEffect(() => {
    if (selectedVariant?.images?.length) {
      setActiveImage(selectedVariant.images[0].url);
    } else {
      setActiveImage(null);
    }
  }, [selectedVariant]);

  if (!selectedVariant || !selectedVariant.images?.length) return null;

  const images = selectedVariant.images;

  return (
    <div className="w-full">
      {/* ================= LIGHTBOX ================= */}
      {isLightboxOpen && activeImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setIsLightboxOpen(false)}
        >
          <img
            src={activeImage}
            alt="Full View"
            className="max-w-full max-h-[90vh] object-contain cursor-zoom-out"
          />
        </div>
      )}

      {/* ================= GALLERY CONTAINER ================= */}
      <div className="w-full bg-white border border-black/10 rounded-md">
        <div className="flex gap-3 p-3">
          {/* ================= THUMBNAILS (DESKTOP) ================= */}
          <div className="hidden lg:flex flex-col gap-2">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(img.url)}
                className={`w-14 h-14 border rounded-sm overflow-hidden transition
                  ${
                    activeImage === img.url
                      ? "border-orange-500"
                      : "border-black/20 hover:border-black/40"
                  }`}
              >
                <img
                  src={img.url}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-contain bg-white"
                />
              </button>
            ))}
          </div>

          {/* ================= MAIN IMAGE ================= */}
          <div
            className="flex-1 flex items-center justify-center cursor-zoom-in"
            onClick={() => setIsLightboxOpen(true)}
          >
            <div className="w-full h-[360px] sm:h-[420px] lg:h-[500px] flex items-center justify-center">
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

        {/* ================= THUMBNAILS (MOBILE) ================= */}
        <div className="flex lg:hidden gap-3 px-3 pb-3 overflow-x-auto">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveImage(img.url)}
              className={`min-w-[64px] h-16 border rounded-sm overflow-hidden
                ${
                  activeImage === img.url
                    ? "border-orange-500"
                    : "border-black/20"
                }`}
            >
              <img
                src={img.url}
                alt={`Thumbnail ${idx + 1}`}
                className="w-full h-full object-contain bg-white"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImageGallery;
