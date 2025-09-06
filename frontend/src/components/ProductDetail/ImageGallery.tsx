"use client";

import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/redux/store";
import { setSelectedImage } from "@/redux/slices/ProductDetailSlice";

const ImageGallery = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { selectedVariant, selectedImage } = useSelector(
    (state: RootState) => state.productDetail
  );
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const mainImage = selectedImage || selectedVariant?.images?.[0]?.url || "/placeholder.png";

  return (
    <div className="w-full">
      {/* Lightbox */}
      {isLightboxOpen && (
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

      {/* Gallery with Premium Frame - Full Width */}
      <div className="w-full relative p-4 lg:p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-gray-200 shadow-xl">
        {/* Decorative Frame Border */}
        <div className="absolute inset-3 lg:inset-4 border-2 border-gray-300 rounded-xl opacity-20 pointer-events-none"></div>
        
        <div className="flex gap-3 lg:gap-4 relative z-10">
          {/* Thumbnails */}
          <div className="w-14 lg:w-16 flex flex-col gap-2 max-h-80 lg:max-h-96 overflow-y-auto bg-white rounded-lg p-1 lg:p-2 shadow-inner">
            {selectedVariant?.images?.map((img, idx) => (
              <div
                key={idx}
                className={`cursor-pointer border-2 rounded-lg overflow-hidden transition-all duration-200 ${
                  mainImage === img.url
                    ? "border-[var(--color-accent)] shadow-lg scale-105"
                    : "border-gray-300 hover:border-[var(--color-accent)] hover:scale-105"
                }`}
                onClick={() => dispatch(setSelectedImage(img.url))}
              >
                <img
                  src={img.url}
                  alt={`View ${idx + 1}`}
                  className="w-12 h-12 lg:w-14 lg:h-14 object-cover"
                />
              </div>
            ))}
          </div>

          {/* Main Image - Full Available Width */}
          <div className="flex-1">
            <div className="w-full h-64 sm:h-80 lg:h-96 bg-white rounded-xl border-2 border-gray-300 shadow-inner p-2 lg:p-4 flex items-center justify-center overflow-hidden">
              <img
                src={mainImage}
                alt="Product"
                className="w-full h-full object-contain cursor-zoom-in transition-transform duration-300 hover:scale-105 rounded-lg shadow-md"
                onClick={() => setIsLightboxOpen(true)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageGallery;
