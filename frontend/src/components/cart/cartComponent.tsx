"use client";

import { DisplayProduct } from "@/types/Product";
import Image from "next/image";
import ActionButton from "@/components/ui/ActionButton";
import { Minus, Plus, Trash2 } from "lucide-react";
import Button from "../ui/Button";

type Props = {
  product: DisplayProduct;
  variantId: string;
  quantity: number;
  onRemove: () => void;
  onQuantityChange: (qty: number) => void;
};

const ProductCartItem = ({
  product,
  variantId,
  quantity,
  onRemove,
  onQuantityChange,
}: Props) => {
  const selectedVariant = product.variants?.find((v) => v._id === variantId);

  if (!selectedVariant) {
    console.error(`Variant ${variantId} not found for product ${product._id}`);
    return null;
  }

  const finalPrice = selectedVariant.hasDiscount
    ? selectedVariant.discountedPrice
    : selectedVariant.price;

  return (
    <div className="bg-[var(--color-card)] rounded shadow-sm border border-[var(--color-border-custom)] hover:shadow-lg transition-shadow">
      <div className="flex gap-3 p-2">
        {/* Left Column - Image and Quantity */}
        <div className="flex flex-col items-center gap-2">
          {/* Product Image */}
          <div className="w-30 h-30 rounded overflow-hidden bg-[var(--color-secondary)] flex items-center justify-center border border-[var(--color-border-custom)] p-2">
            <Image
              src={selectedVariant.images?.[0]?.url || "/placeholder.jpg"}
              alt={product.name}
              width={100}
              height={100}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Quantity Controls - Under Image */}
          <div className="flex items-center bg-[var(--color-secondary)] rounded border border-[var(--color-border-custom)]">
            <ActionButton
              icon={Minus}
              variant="secondary"
              size="sm"
              onClick={() => quantity > 1 && onQuantityChange(quantity - 1)}
              disabled={quantity <= 1}
              className="rounded-r-none border-none px-1.5"
            />
            <span className="px-2 py-1 text-sm font-medium text-[var(--color-foreground)] min-w-[24px] text-center">
              {quantity}
            </span>
            <ActionButton
              icon={Plus}
              variant="secondary"
              size="sm"
              onClick={() => onQuantityChange(quantity + 1)}
              disabled={quantity >= (selectedVariant.stock || 999)}
              className="rounded-l-none border-none px-1.5"
            />
          </div>
        </div>

        {/* Right Column - Product Info */}
        <div className="flex-1 min-w-0">
          {/* Product Title */}
          <h3 className="text-base font-semibold text-[var(--color-foreground)] truncate">
            {product.name}
          </h3>
          <p className="text-[var(--text-accent)] text-sm truncate">
            {product.title}
          </p>

          {/* Variant Details */}
          <div className="text-sm text-[var(--text-accent)] mt-1">
            <span>Color: {selectedVariant.color}</span> •{" "}
            <span>Size: {selectedVariant.size}</span>
            <br />
            <span
              className={
                selectedVariant.stock && selectedVariant.stock > 0
                  ? "text-green-600"
                  : "text-red-500"
              }
            >
              Stock: {selectedVariant.stock || 0}
            </span>
          </div>

          {/* Price Section */}
          <div className="mt-2">
            <div className="flex items-center gap-2">
              <span className="text-lg font-medium text-[var(--color-foreground)]">
                ₹{finalPrice?.toLocaleString()}
              </span>

              {selectedVariant.hasDiscount && selectedVariant.price && (
                <span className="text-sm line-through text-gray-500">
                  ₹{selectedVariant.price.toLocaleString()}
                </span>
              )}

              {selectedVariant.hasDiscount && (
                <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-xs">
                  {selectedVariant.discountPercent}% off
                </span>
              )}
            </div>

            {selectedVariant.hasDiscount && selectedVariant.savings && (
              <p className="text-sm text-green-600 mt-0.5">
                You save ₹{selectedVariant.savings.toLocaleString()}
              </p>
            )}
          </div>

          {/* Remove Button - Bottom Left */}
          <div className="flex justify-start mt-2">
            <button 
              className="font-semibold text-red-600 hover:text-red-800 cursor-pointer text-sm transition-colors" 
              onClick={onRemove}
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCartItem;
