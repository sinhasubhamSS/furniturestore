"use client";
import React from "react";
import { useRouter } from "next/navigation";

type Product = {
  id: string;
  title: string;
  price: number;
  images: string[];
};

const ProductCard = ({ id, title, price, images }: Product) => {
  const router = useRouter();
  const mainImage = images[0];

  return (
    <div
      onClick={() => router.push(`/products/${id}`)}
      className="group bg-[var(--color-secondary)] p-4 rounded-lg shadow-md hover:shadow-xl transition-transform hover:-translate-y-1 duration-300 max-w-sm cursor-pointer"
    >
      {/* Image */}
      <div className="w-full aspect-square overflow-hidden rounded-md mb-3 bg-white">
        <img
          src={mainImage}
          alt={title}
          className="w-full h-full object-contain" // shows full image without crop
        />
      </div>

      {/* Title */}
      <h2 className="text-[var(--foreground)] text-lg font-semibold mb-1 line-clamp-2">
        {title}
      </h2>

      {/* Price */}
      <p className="text-[var(--foreground)] font-bold text-base">₹{price}</p>
    </div>
  );
};

export default ProductCard;
