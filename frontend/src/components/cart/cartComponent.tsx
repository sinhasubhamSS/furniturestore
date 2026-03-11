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
    const variant = item.product.variants[0]!;

    const image =
      variant.images?.[0]?.thumbSafe ||
      variant.images?.[0]?.url ||
      "/placeholder.jpg";

    return (
      <div className="bg-[var(--color-card)] rounded-lg border border-[var(--color-border-custom)]">
        <div className="flex items-start gap-3 p-3">
          {/* IMAGE + QTY */}
          <div className="flex flex-col items-center gap-2 shrink-0">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded bg-[var(--color-secondary)] overflow-hidden border">
              <Image
                src={image}
                alt={item.product.name}
                width={96}
                height={96}
                className="w-full h-full object-contain"
              />
            </div>

            {/* QUANTITY CONTROL */}
            <div className="flex items-center border border-[var(--color-accent)] rounded-md overflow-hidden">
              <ActionButton
                icon={Minus}
                size="sm"
                className="
    bg-transparent
    hover:bg-transparent
    !text-[var(--color-accent)]
  "
                onClick={() =>
                  item.quantity > 1 && onQuantityChange(item.quantity - 1)
                }
                disabled={item.quantity <= 1}
              />

              <span className="px-2 text-sm font-semibold">
                {item.quantity}
              </span>

              <ActionButton
                icon={Plus}
                size="sm"
                className="
    bg-transparent
    hover:bg-transparent
    !text-[var(--color-accent)]
  "
                onClick={() => onQuantityChange(item.quantity + 1)}
              />
            </div>
          </div>

          {/* PRODUCT INFO */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm sm:text-base leading-tight line-clamp-2 break-words">
              {item.product.name}
            </h3>

            <p className="text-xs sm:text-sm text-[var(--text-accent)] mt-1">
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
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <span className="text-lg font-bold text-[var(--color-accent)]">
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
              className="
                text-sm mt-2
                text-[var(--color-accent)]
                hover:underline
              "
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
