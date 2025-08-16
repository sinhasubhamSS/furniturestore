import Image from "next/image";
import { Product, DisplayProduct, Variant } from "@/types/Product";

export type CheckoutItem = {
  product: Product | DisplayProduct;
  variantId: string;
  quantity: number;
};

interface CheckoutSummaryProps {
  items: CheckoutItem[];
  total: number;
  allowQuantityEdit?: boolean;
  onQuantityChange?: (index: number, quantity: number) => void;
}

const CheckoutSummary = ({
  items,
  total,
  allowQuantityEdit = false,
  onQuantityChange,
}: CheckoutSummaryProps) => {
  if (!items.length)
    return <p className="text-center text-gray-500">Your cart is empty</p>;

  return (
    <div className="max-w-xl mx-auto bg-[--color-card] text-[--text] p-6 rounded-xl shadow-lg border border-[--color-border]">
      <h2 className="text-2xl font-bold mb-6">Checkout Summary</h2>
      <div className="space-y-4 max-h-96 overflow-auto">
        {items.map(({ product, variantId, quantity }, idx) => {
          // ✅ Find the selected variant
          const selectedVariant = product.variants?.find(
            (v) => v._id === variantId
          );

          if (!selectedVariant) {
            console.error(
              `Variant ${variantId} not found for product ${product._id}`
            );
            return null;
          }

          // ✅ Use variant's pricing (with discount)
          const itemTotal = selectedVariant.discountedPrice * quantity;

          return (
            <div
              key={`${product._id}-${variantId}`}
              className="flex gap-4 items-center"
            >
              {/* ✅ Use variant's image */}
              <Image
                src={selectedVariant.images?.[0]?.url || "/placeholder.jpg"}
                alt={product.name}
                width={100}
                height={100}
                className="rounded-md object-cover border"
              />
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{product.name}</h3>

                {/* ✅ Show variant details */}
                <p className="text-sm text-muted">
                  {selectedVariant.color} • {selectedVariant.size}
                </p>

                {product.description && (
                  <p className="text-sm text-muted line-clamp-2">
                    {product.description}
                  </p>
                )}

                <div className="mt-1">
                  {/* ✅ Show discount pricing */}
                  {selectedVariant.hasDiscount ? (
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-accent">
                        ₹{selectedVariant.discountedPrice.toFixed(2)}
                      </span>
                      <span className="text-sm line-through text-muted">
                        ₹{selectedVariant.basePrice.toFixed(2)}
                      </span>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        {selectedVariant.discountPercent}% OFF
                      </span>
                    </div>
                  ) : (
                    <span className="font-medium text-accent">
                      ₹{selectedVariant.basePrice.toFixed(2)}
                    </span>
                  )}

                  {quantity > 1 && (
                    <p className="text-sm text-muted">
                      × {quantity} = ₹{itemTotal.toFixed(2)}
                    </p>
                  )}
                </div>

                <p className="text-xs text-muted">
                  Available Stock: {selectedVariant.stock}
                </p>

                {allowQuantityEdit && onQuantityChange && (
                  <div className="flex gap-2 mt-3">
                    <button
                      className="btn-xs"
                      disabled={quantity <= 1}
                      onClick={() => onQuantityChange(idx, quantity - 1)}
                    >
                      −
                    </button>
                    <span className="w-6 text-center">{quantity}</span>
                    <button
                      className="btn-xs"
                      disabled={quantity >= selectedVariant.stock}
                      onClick={() => onQuantityChange(idx, quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <hr className="my-5 border-border" />
      <div className="flex justify-between text-xl font-bold">
        <span>Total</span>
        <span>₹{total.toFixed(2)}</span>
      </div>
    </div>
  );
};

export default CheckoutSummary;
