"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Product } from "@/types/Product";

type Props = {
  product: Product;
};

const ProductCard = ({ product }: Props) => {
  const router = useRouter();
  const { _id, title, price, images, slug } = product;

  return (
    <div
      onClick={() => router.push(`/products/${slug}`)}
      className="cursor-pointer bg-white dark:bg-[var(--color-secondary)] p-4 rounded-xl shadow-md hover:shadow-lg transition-transform duration-300 hover:-translate-y-1"
    >
      <div className="w-full aspect-square mb-3 rounded-md overflow-hidden bg-white">
        <img
          src={images?.[0]?.url}
          alt={title}
          loading="lazy"
          className="w-full h-full object-contain"
        />
      </div>

      <h3 className="text-sm font-medium text-[var(--foreground)] line-clamp-2">
        {title}
      </h3>

      <p className="text-sm font-semibold text-[var(--foreground)] mt-1">
        ₹{price}
      </p>
    </div>
  );
};

export default ProductCard;
