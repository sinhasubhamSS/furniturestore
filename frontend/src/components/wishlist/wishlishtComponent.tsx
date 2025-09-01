"use client";

import { DisplayProduct } from "@/types/Product";

type Props = {
  product: DisplayProduct; // ✅ Correct type
  onRemove: () => void;
  onAddToCart?: () => void;
};

const WishlistItem = ({ product, onRemove, onAddToCart }: Props) => {
  // ✅ Safety check for variants
  const firstVariant = product.variants?.[0];
  
  if (!firstVariant) {
    return (
      <div className="p-4 text-center text-gray-500">
        Product variant not available
      </div>
    );
  }

  const displayPrice = firstVariant.hasDiscount 
    ? firstVariant.discountedPrice 
    : firstVariant.basePrice;

  return (
    <div className="flex flex-col sm:flex-row gap-6 bg-white p-6 rounded-xl shadow-md border border-gray-200">
      {/* Image */}
      <div className="w-28 h-28 rounded-lg overflow-hidden bg-white flex items-center justify-center border">
        <img
          src={firstVariant.images?.[0]?.url || "/placeholder.jpg"}
          alt={product.name}
          className="w-full h-full object-contain"
        />
      </div>

      {/* Info */}
      <div className="flex-1 flex flex-col justify-between">
        <div className="flex justify-between items-start gap-4">
          <div>
            <h3 className="text-lg font-semibold mb-1">{product.name}</h3>
            <p className="text-sm text-gray-500">{product.title}</p>
            <p className="text-sm text-gray-500">{product.category?.name}</p>
            
            {/* Variant info */}
            <div className="flex gap-2 mt-1">
              <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                {firstVariant.color}
              </span>
              <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                {firstVariant.size}
              </span>
            </div>
          </div>
          
          <button
            onClick={onRemove}
            className="text-xs text-red-600 hover:text-red-800 hover:underline font-medium"
          >
            Remove
          </button>
        </div>

        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center gap-2">
            <span className="text-blue-600 font-bold text-lg">
              ₹{displayPrice?.toFixed(2) || '0.00'}
            </span>
            {firstVariant.hasDiscount && (
              <>
                <span className="text-sm text-gray-500 line-through">
                  ₹{firstVariant.basePrice?.toFixed(2)}
                </span>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  {firstVariant.discountPercent}% OFF
                </span>
              </>
            )}
          </div>

          {onAddToCart && (
            <button
              onClick={onAddToCart}
              className="text-sm text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md transition-colors"
            >
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WishlistItem;
