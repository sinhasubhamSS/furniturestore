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

  const mainImage =
    selectedImage || selectedVariant?.images?.[0]?.url || "/placeholder.png";

  const toggleLightbox = () => setIsLightboxOpen(!isLightboxOpen);

  return (
    <div className="w-full relative">
      {/* Lightbox */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={toggleLightbox}
        >
          <img
            src={mainImage}
            alt="Full View"
            className="max-w-full max-h-[90vh] object-contain cursor-zoom-out"
          />
        </div>
      )}

      {/* Main Gallery Layout - Minimal gaps */}
      <div className="flex gap-2">
        {" "}
        {/* Reduced gap from 4 to 2 */}
        {/* Thumbnails - Left side with minimal space */}
        <div className="w-16 flex flex-col gap-1 overflow-y-auto max-h-[480px] p-1 bg-gray-50 rounded-lg">
          {" "}
          {/* Minimal padding and gap */}
          {selectedVariant?.images?.map((img, idx) => (
            <div
              key={idx}
              className={`cursor-pointer border-2 rounded-md overflow-hidden transition-all duration-300 flex-shrink-0 ${
                mainImage === img.url
                  ? "border-[--color-accent] scale-105 shadow-md"
                  : "border-gray-300 hover:border-[--color-accent] hover:scale-105"
              }`}
              onClick={() => dispatch(setSelectedImage(img.url))}
            >
              <img
                src={img.url}
                alt={`Thumbnail ${idx + 1}`}
                className="w-14 h-14 object-cover rounded-sm" // Smaller thumbnails
              />
            </div>
          ))}
          {(!selectedVariant?.images ||
            selectedVariant.images.length === 0) && (
            <div className="text-xs text-gray-500 text-center p-2">
              No images
            </div>
          )}
        </div>
        {/* Main Image Container - Fixed and full visibility */}
        <div className="flex-1 max-w-[480px]">
          {" "}
          {/* Adjusted container width */}
          <div className="w-full h-[480px] bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden p-2">
            {" "}
            {/* Minimal padding */}
            <img
              src={mainImage}
              alt="Main Product"
              className="w-full h-full object-contain transition-transform duration-300 hover:scale-105 cursor-zoom-in" // Changed to object-contain for full image visibility
              onClick={toggleLightbox}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageGallery;
