import Image from "next/image";

export type Product = {
  _id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  images: { url: string }[];
};

export type CheckoutItem = {
  product: Product;
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
        {items.map(({ product, quantity }, idx) => {
          const itemTotal = product.price * quantity;
          return (
            <div key={product._id} className="flex gap-4 items-center">
              <Image
                src={product.images?.[0]?.url || "/placeholder.jpg"}
                alt={product.name}
                width={100}
                height={100}
                className="rounded-md object-cover border"
              />
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{product.name}</h3>
                {product.description && (
                  <p className="text-sm text-muted line-clamp-2">
                    {product.description}
                  </p>
                )}
                <p className="mt-1 font-medium text-accent">
                  ₹{product.price.toFixed(2)}
                  {quantity > 1 && ` × ${quantity} = ₹${itemTotal.toFixed(2)}`}
                </p>
                <p className="text-xs text-muted">
                  Available Stock: {product.stock}
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
                      disabled={quantity >= product.stock}
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
