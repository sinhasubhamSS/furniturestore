"use client";
import { CartProduct } from "@/types/cart";

type Props = {
  product: CartProduct;
  quantity: number;
  onRemove: () => void;
  onQuantityChange: (qty: number) => void;
};

const ProductCartItem = ({
  product,
  quantity,
  onRemove,
  onQuantityChange,
}: Props) => (
  <div className="flex flex-col sm:flex-row gap-6 bg-[--color-card] p-6 rounded-xl shadow-md border border-[--color-border] transition-shadow hover:shadow-lg">
    {/* Product Image */}
    <div className="w-28 h-28 rounded-lg overflow-hidden bg-white flex items-center justify-center border">
      <img
        src={product.images[0]?.url}
        alt={product.name}
        className="w-full h-full object-contain"
      />
    </div>
    {/* Info and Actions */}
    <div className="flex-1 flex flex-col justify-between">
      <div className="flex justify-between items-start gap-4">
        <div>
          <h3 className="text-lg font-semibold mb-1">{product.name}</h3>
          <p className="text-sm text-[--color-muted] mb-1">{product.title}</p>
        </div>
        <button
          onClick={onRemove}
          className="text-xs sm:text-sm text-red-600 hover:bg-red-50 px-3 py-1 rounded-md font-medium transition-colors"
        >
          Remove
        </button>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-2">
        <div className="text-[--color-accent] font-bold text-base">
          ₹{product.price.toFixed(2)}
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor={`qty-${product._id}`} className="text-sm">
            Qty:
          </label>
          <input
            id={`qty-${product._id}`}
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => onQuantityChange(Number(e.target.value))}
            className="w-16 px-2 py-1 border border-[--color-border] rounded text-center bg-white focus:ring-2 focus:ring-[--color-accent] focus:outline-none transition"
          />
        </div>
      </div>
    </div>
  </div>
);

export default ProductCartItem;
