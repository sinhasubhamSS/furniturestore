"use client";

import Image from "next/image";
import ActionButton from "@/components/ui/ActionButton";
import { Minus, Plus } from "lucide-react";
import React from "react";

type CartItem = {
  productId: string;
  name: string;
  slug: string;
  variantId: string;
  sku: string;
  color?: string;
  size?: string;
  image?: string;
  quantity: number;
  listingPrice: number;
  sellingPrice: number;
  discountPercent: number;
  hasDiscount: boolean;
};

type Props = {
  item: CartItem;
  onRemove: () => void;
  onQuantityChange: (qty: number) => void;
};

const ProductCartItem = React.memo(
  ({ item, onRemove, onQuantityChange }: Props) => {
    return (
      <div className="bg-[var(--color-card)] rounded shadow-sm border border-[var(--color-border-custom)]">
        <div className="flex gap-4 p-3">
          {/* Image + Qty */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-24 h-24 rounded bg-[var(--color-secondary)] overflow-hidden border">
              <Image
                src={item.image || "/placeholder.jpg"}
                alt={item.name}
                width={96}
                height={96}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="flex items-center border rounded">
              <ActionButton
                icon={Minus}
                size="sm"
                onClick={() =>
                  item.quantity > 1 && onQuantityChange(item.quantity - 1)
                }
                disabled={item.quantity <= 1}
              />
              <span className="px-2 text-sm font-medium">{item.quantity}</span>
              <ActionButton
                icon={Plus}
                size="sm"
                onClick={() => onQuantityChange(item.quantity + 1)}
              />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1">
            <h3 className="font-semibold truncate">{item.name}</h3>

            <p className="text-sm text-[var(--text-accent)]">
              {item.color} {item.size ? `• ${item.size}` : ""}
            </p>

            {/* Price */}
            <div className="mt-2 flex items-center gap-2">
              <span className="text-lg font-bold">
                ₹{item.sellingPrice.toLocaleString()}
              </span>

              {item.hasDiscount && (
                <>
                  <span className="line-through text-gray-500 text-sm">
                    ₹{item.listingPrice.toLocaleString()}
                  </span>
                  <span className="text-green-600 text-xs font-semibold">
                    {item.discountPercent}% OFF
                  </span>
                </>
              )}
            </div>

            <button
              onClick={onRemove}
              className="text-red-600 text-sm mt-2 hover:underline"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    );
  }
);

export default ProductCartItem;
