"use client";
import { CartProduct } from "@/types/cart";

type Props = {
  product: CartProduct;
  onRemove: () => void;
  onAddToCart?: () => void; // optional button
};

const WishlistItem = ({ product, onRemove, onAddToCart }: Props) => {
  return (
    <div className="flex flex-col sm:flex-row gap-6 bg-[--color-card] p-6 rounded-xl shadow-md border border-[--color-border]">
      {/* Image */}
      <div className="w-28 h-28 rounded-lg overflow-hidden bg-white flex items-center justify-center border">
        <img
           src={product.images?.[0]?.url || "/placeholder.jpg"}
          alt={product.name}
          className="w-full h-full object-contain"
        />
      </div>

      {/* Info */}
      <div className="flex-1 flex flex-col justify-between">
        <div className="flex justify-between items-start gap-4">
          <div>
            <h3 className="text-lg font-semibold mb-1">{product.name}</h3>
            <p className="text-sm text-[--color-muted]">{product.title}</p>
          </div>
          <button
            onClick={onRemove}
            className="text-xs text-red-600 hover:underline"
          >
            Remove
          </button>
        </div>

        <div className="flex justify-between items-center mt-2">
          <div className="text-[--color-accent] font-bold text-base">
            ₹{product.price.toFixed(2)}
          </div>

          {onAddToCart && (
            <button
              onClick={onAddToCart}
              className="text-sm text-white bg-[--color-accent] hover:brightness-110 px-4 py-1.5 rounded-md"
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
