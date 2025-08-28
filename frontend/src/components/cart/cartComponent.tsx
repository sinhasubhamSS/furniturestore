"use client";

import { DisplayProduct } from "@/types/Product";
import Image from "next/image";

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
  // ✅ Find the selected variant
  const selectedVariant = product.variants?.find((v) => v._id === variantId);

  if (!selectedVariant) {
    console.error(`Variant ${variantId} not found for product ${product._id}`);
    return null;
  }

  // ✅ Use correct property names matching your schema
  const displayPrice = selectedVariant.hasDiscount
    ? selectedVariant.discountedPrice || 0
    : selectedVariant.price || 0;

  return (
    <div className="flex flex-col sm:flex-row gap-6 bg-[--color-card] p-6 rounded-xl shadow-md border border-[--color-border] transition-shadow hover:shadow-lg">
      {/* Product Image */}
      <div className="w-28 h-28 rounded-lg overflow-hidden bg-white flex items-center justify-center border">
        <Image
          src={selectedVariant.images?.[0]?.url || "/placeholder.jpg"}
          alt={product.name}
          width={112}
          height={112}
          className="w-full h-full object-contain"
        />
      </div>

      {/* Product Info and Actions */}
      <div className="flex-1 flex flex-col justify-between">
        <div className="flex justify-between items-start gap-4">
          <div>
            <h3 className="text-lg font-semibold mb-1">{product.name}</h3>
            <p className="text-sm text-[--color-muted] mb-1">{product.title}</p>

            {/* ✅ Show variant details */}
            <div className="flex gap-2 text-xs text-gray-600">
              <span className="bg-gray-100 px-2 py-1 rounded">
                {selectedVariant.color}
              </span>
              <span className="bg-gray-100 px-2 py-1 rounded">
                {selectedVariant.size}
              </span>
            </div>
          </div>

          <button
            onClick={onRemove}
            className="text-xs sm:text-sm text-red-600 hover:bg-red-50 px-3 py-1 rounded-md font-medium transition-colors"
          >
            Remove
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-4">
          {/* ✅ Price with discount display */}
          <div className="flex items-center gap-2">
            <span className="text-[--color-accent] font-bold text-base">
              ₹{displayPrice.toFixed(2)}
            </span>
            {selectedVariant.hasDiscount && selectedVariant.price && (
              <>
                <span className="text-sm line-through text-gray-500">
                  ₹{selectedVariant.price.toFixed(2)}
                </span>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  {selectedVariant.discountPercent || 0}% OFF
                </span>
              </>
            )}
          </div>

          {/* Quantity Control */}
          <div className="flex items-center gap-2">
            <label
              htmlFor={`qty-${product._id}-${variantId}`}
              className="text-sm"
            >
              Qty:
            </label>
            <input
              id={`qty-${product._id}-${variantId}`}
              type="number"
              min={1}
              max={selectedVariant.stock || 999}
              value={quantity}
              onChange={(e) => onQuantityChange(Number(e.target.value))}
              className="w-16 px-2 py-1 border border-[--color-border] rounded text-center bg-white focus:ring-2 focus:ring-[--color-accent] focus:outline-none transition"
            />
            <span className="text-xs text-gray-500">
              (Stock: {selectedVariant.stock || 0})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCartItem;
