"use client";

import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/redux/store";
import { setSelectedImage } from "@/redux/slices/ProductDetailSlice";

const ImageGallery = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { selectedVariant, selectedImage } = useSelector(
    (state: RootState) => state.productDetail
  );

  const mainImage =
    selectedImage || selectedVariant?.images?.[0]?.url || "/placeholder.png";

  return (
    <div className="w-full lg:w-1/2 flex flex-col lg:flex-row-reverse gap-6"> {/* flex-row-reverse से thumbnails left, main right */}
      {/* Main Image (Right Side on desktop) */}
      <div className="flex-1 bg-white rounded-2xl shadow-xl p-6 border border-gray-200 sticky top-24">
        <img
          src={mainImage}
          alt="Main Product"
          className="w-full h-auto max-h-[700px] object-contain rounded-xl transition-transform duration-300 hover:scale-105"
        />
      </div>

      {/* Thumbnails (Left Side) – Vertical on desktop, horizontal scroll on mobile */}
      <div className="w-full lg:w-28 flex flex-row lg:flex-col gap-4 overflow-x-auto lg:overflow-y-auto max-h-[700px] p-3 bg-gray-50 rounded-2xl shadow-md"> {/* Better container design */}
        {selectedVariant?.images?.map((img, idx) => (
          <div
            key={idx}
            className={`cursor-pointer border-2 rounded-xl overflow-hidden transition-all duration-300 ${
              mainImage === img.url
                ? "border-[--color-accent] scale-105 shadow-lg"
                : "border-gray-300 hover:border-[--color-accent] hover:scale-110 hover:shadow-lg"
            }`}
            onClick={() => dispatch(setSelectedImage(img.url))}
          >
            <img
              src={img.url}
              alt={`Thumbnail ${idx + 1}`}
              className="w-20 h-20 lg:w-24 lg:h-24 object-cover rounded-md"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageGallery;
