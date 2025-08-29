import Image from "next/image";
import { Product, DisplayProduct } from "@/types/Product";

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
  deliveryCharge?: number;
  deliveryInfo?: any;
  deliveryAvailable?: boolean;
  hasSelectedAddress?: boolean;
  showAddressPrompt?: boolean;
  isHydrated?: boolean;
}

const CheckoutSummary = ({
  items,
  total,
  allowQuantityEdit = false,
  onQuantityChange,
  deliveryCharge = 0,
  deliveryInfo = null,
  deliveryAvailable = true,
  hasSelectedAddress = false,
  showAddressPrompt = true,
  
}: CheckoutSummaryProps) => {
  if (!items.length) {
    return <p className="text-center text-gray-500">Your cart is empty</p>;
  }

  const subtotal = total;
  // ✅ Only calculate delivery charge if address is selected
  const finalDeliveryCharge = hasSelectedAddress ? (deliveryCharge || 0) : 0;
  const grandTotal = subtotal + finalDeliveryCharge;

  // ✅ WhatsApp Contact Function
  const handleWhatsAppContact = () => {
    const message = encodeURIComponent(
      `Hi! I need help with delivery to my location. My cart total is ₹${grandTotal.toFixed(2)}. Can you please check if delivery is possible?`
    );
    const whatsappNumber = "919876543210"; // ✅ Replace with your WhatsApp business number
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

  return (
    <div className="max-w-xl mx-auto bg-white text-gray-900 p-6 rounded-xl shadow-lg border border-gray-200">
      <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

      {/* Items List */}
      <div className="space-y-4 max-h-80 overflow-auto mb-6">
        {items.map(({ product, variantId, quantity }, idx) => {
          const selectedVariant = product.variants?.find(v => v._id === variantId);
          if (!selectedVariant) return null;

          const finalPrice = selectedVariant.hasDiscount
            ? (selectedVariant.discountedPrice ?? 0)
            : (selectedVariant.price ?? 0);

          const itemTotal = finalPrice * quantity;

          return (
            <div key={`${product._id}-${variantId}`} className="flex gap-4 items-start p-3 border border-gray-100 rounded-lg">
              <Image
                src={selectedVariant.images?.[0]?.url || "/placeholder.jpg"}
                alt={product.name}
                width={80}
                height={80}
                className="rounded-md object-cover border"
              />

              <div className="flex-1">
                <h3 className="text-lg font-semibold">{product.name}</h3>
                <p className="text-sm text-gray-600 mb-1">
                  {selectedVariant.color} • {selectedVariant.size}
                </p>

                <div className="mb-2">
                  {selectedVariant.hasDiscount ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-green-600 text-base">
                        ₹{(selectedVariant.discountedPrice ?? 0).toFixed(2)}
                      </span>
                      <span className="text-sm line-through text-gray-500">
                        ₹{(selectedVariant.price ?? 0).toFixed(2)}
                      </span>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        {selectedVariant.discountPercent ?? 0}% OFF
                      </span>
                    </div>
                  ) : (
                    <span className="font-semibold text-gray-900 text-base">
                      ₹{(selectedVariant.price ?? 0).toFixed(2)}
                    </span>
                  )}

                  {quantity > 1 && (
                    <p className="text-sm text-gray-600 mt-1">
                      × {quantity} = ₹{itemTotal.toFixed(2)}
                    </p>
                  )}
                </div>

                <p className="text-xs text-gray-500 mb-2">
                  Stock: {selectedVariant.stock ?? 0} available
                </p>

                {allowQuantityEdit && onQuantityChange && (
                  <div className="flex items-center gap-2">
                    <button
                      className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 flex items-center justify-center text-sm font-medium"
                      disabled={quantity <= 1}
                      onClick={() => onQuantityChange(idx, quantity - 1)}
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-medium">{quantity}</span>
                    <button
                      className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 flex items-center justify-center text-sm font-medium"
                      disabled={quantity >= (selectedVariant.stock ?? 0)}
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

      {/* ✅ Enhanced Price Breakdown with Address Selection Logic */}
      <div className="border-t border-gray-200 pt-4">
        <div className="space-y-3 mb-4">
          {/* Subtotal */}
          <div className="flex justify-between text-base">
            <span className="text-gray-700">
              Subtotal ({items.length} item{items.length > 1 ? 's' : ''}):
            </span>
            <span className="font-medium">₹{subtotal.toFixed(2)}</span>
          </div>

          {/* ✅ Conditional Delivery Section */}
          {!hasSelectedAddress ? (
            // ✅ Address Selection Prompt
            showAddressPrompt && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">📍</span>
                  <span className="font-semibold text-amber-800">
                    Select delivery address
                  </span>
                </div>
                <p className="text-amber-700 text-sm mb-3">
                  Please select your delivery address to see shipping charges and delivery options.
                </p>
                <div className="text-xs text-amber-600">
                  💡 Delivery charges will be calculated based on your selected location
                </div>
              </div>
            )
          ) : (
            // ✅ Show delivery info only when address is selected
            <>
              <div className="flex justify-between text-base">
                <span className="text-gray-700">
                  Delivery{deliveryInfo?.deliveryDays ? ` (${deliveryInfo.deliveryDays} days)` : ''}:
                </span>
                <span className="font-medium">
                  {!deliveryAvailable ? (
                    <span className="text-red-600 font-semibold">Not Available</span>
                  ) : finalDeliveryCharge === 0 ? (
                    <span className="text-green-600 font-semibold">FREE</span>
                  ) : (
                    `₹${finalDeliveryCharge.toFixed(2)}`
                  )}
                </span>
              </div>

              {/* ✅ Non-Deliverable Message - Only when address selected */}
              {!deliveryAvailable && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="text-red-800 text-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">📍</span>
                      <span className="font-semibold">
                        Delivery not available to your selected address
                      </span>
                    </div>
                    <p className="text-xs mb-3 text-red-700">
                      We currently don't deliver to this area. Try selecting a different address or contact us for alternatives.
                    </p>
                    <button
                      onClick={handleWhatsAppContact}
                      className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      <span>💬</span>
                      Contact us on WhatsApp
                    </button>
                  </div>
                </div>
              )}

              {/* Additional delivery details - Only when address selected */}
              {deliveryAvailable && deliveryInfo?.weightSurcharge && deliveryInfo.weightSurcharge > 0 && (
                <div className="flex justify-between text-sm text-orange-600">
                  <span>Weight Surcharge:</span>
                  <span>+₹{deliveryInfo.weightSurcharge.toFixed(2)}</span>
                </div>
              )}

              {deliveryAvailable && deliveryInfo?.discount && deliveryInfo.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Delivery Discount:</span>
                  <span>-₹{deliveryInfo.discount.toFixed(2)}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Grand Total */}
        <div className="border-t border-gray-300 pt-3">
          <div className="flex justify-between text-xl font-bold">
            <span className="text-gray-900">
              {hasSelectedAddress ? 'Total Amount:' : 'Subtotal:'}
            </span>
            <span className="text-green-600">₹{grandTotal.toFixed(2)}</span>
          </div>
          
          {/* ✅ Helper text when no address selected */}
          {!hasSelectedAddress && (
            <p className="text-xs text-gray-500 mt-1">
              *Final amount will be calculated after address selection
            </p>
          )}
        </div>

        {/* ✅ Delivery Info Summary - Only when address selected and deliverable */}
        {hasSelectedAddress && deliveryAvailable && deliveryInfo && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-blue-900">
                  🚚 {deliveryInfo.courierPartner || 'Standard Delivery'}
                </span>
                <span className="text-blue-700 font-medium">
                  COD: {deliveryInfo.codAvailable ? '✅' : '❌'}
                </span>
              </div>
              <p className="text-blue-700">
                Estimated delivery: {deliveryInfo.deliveryDays} days
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutSummary;
