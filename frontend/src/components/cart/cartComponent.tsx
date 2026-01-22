"use client";

import Image from "next/image";
import ActionButton from "@/components/ui/ActionButton";
import { Minus, Plus } from "lucide-react";
import React from "react";
import { CartItem } from "@/types/cart";

type Props = {
  item: CartItem;
  onRemove: () => void;
  onQuantityChange: (qty: number) => void;
};

const ProductCartItem = React.memo(
  ({ item, onRemove, onQuantityChange }: Props) => {
    // ✅ Guaranteed by backend
    const variant = item.product.variants[0]!;

    const image =
      variant.images?.[0]?.thumbSafe ||
      variant.images?.[0]?.url ||
      "/placeholder.jpg";

    return (
      <div className="bg-[var(--color-card)] rounded shadow-sm border border-[var(--color-border-custom)]">
        <div className="flex gap-4 p-3">
          {/* IMAGE + QTY */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-24 h-24 rounded bg-[var(--color-secondary)] overflow-hidden border">
              <Image
                src={image}
                alt={item.product.name}
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

          {/* INFO */}
          <div className="flex-1">
            <h3 className="font-semibold truncate">{item.product.name}</h3>

            <p className="text-sm text-[var(--text-accent)]">
              {[
                variant.attributes?.finish,
                variant.attributes?.size,
                variant.attributes?.seating,
                variant.attributes?.configuration,
              ]
                .filter(Boolean)
                .join(" • ")}
            </p>

            {/* PRICE */}
            <div className="mt-2 flex items-center gap-2">
              <span className="text-lg font-bold">
                ₹{variant.sellingPrice!.toLocaleString()}
              </span>

              {variant.hasDiscount && (
                <>
                  <span className="line-through text-gray-500 text-sm">
                    ₹{variant.listingPrice!.toLocaleString()}
                  </span>
                  <span className="text-green-600 text-xs font-semibold">
                    {variant.discountPercent}% OFF
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
  },
);

ProductCartItem.displayName = "ProductCartItem";
export default ProductCartItem;
