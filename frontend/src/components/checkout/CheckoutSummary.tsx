"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { useGetProductByIDQuery } from "@/redux/services/user/publicProductApi";
import {
  setProduct,
  setQuantity as setReduxQuantity,
} from "@/redux/slices/checkoutSlice";

const CheckoutSummary = () => {
  const searchParams = useSearchParams();
  const productId = searchParams.get("product");
  const [quantity, setQuantity] = useState(1);
  const dispatch = useDispatch();

  const {
    data: product,
    isLoading,
    error,
  } = useGetProductByIDQuery(productId!, {
    skip: !productId,
  });

  useEffect(() => {
    if (product?._id) {
      dispatch(setProduct(product)); // Only ID stored in Redux
      dispatch(setReduxQuantity(quantity));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product]);

  if (!productId) {
    return (
      <p className="text-[--text-error] text-center">No product selected.</p>
    );
  }

  if (isLoading) {
    return (
      <p className="text-center text-[--color-muted-foreground] animate-pulse">
        Loading product...
      </p>
    );
  }

  if (error || !product) {
    return (
      <p className="text-[--text-error] text-center">
        Failed to fetch product details.
      </p>
    );
  }

  if (product.stock === 0) {
    return (
      <div className="text-center p-6 text-[--text-error]">
        <h2 className="text-2xl font-bold mb-2">{product.name}</h2>
        <p>Out of Stock</p>
      </div>
    );
  }

  const gstAmount = (product.price * product.gstRate) / 100;
  const priceWithGst = product.price + gstAmount;
  const total = priceWithGst * quantity;

  const updateQuantity = (newQty: number) => {
    const validQty = Math.max(1, Math.min(newQty, product.stock));
    setQuantity(validQty);
    dispatch(setReduxQuantity(validQty));
  };

  return (
    <div className="max-w-xl mx-auto bg-[--color-card] text-[--text-dark] dark:text-[--text-light] p-6 rounded-xl shadow-lg border border-[--color-border]">
      <h2 className="text-2xl font-bold mb-6">Checkout Summary</h2>

      <div className="flex items-center gap-4">
        <Image
          src={product.images[0].url}
          alt={product.name}
          width={100}
          height={100}
          className="rounded-md object-cover border"
        />

        <div className="flex-1">
          <h3 className="text-lg font-semibold">{product.name}</h3>
          <p className="text-sm text-[--color-muted-foreground]">
            {product.description}
          </p>
          <p className="mt-1 font-medium text-[--text-accent]">
            ₹ {priceWithGst.toFixed(2)} (incl. GST)
          </p>

          <div className="flex items-center gap-2 mt-3">
            <button
              className="w-8 h-8 text-lg border border-[--color-border] rounded text-[--text-dark] dark:text-[--text-light]"
              onClick={() => updateQuantity(quantity - 1)}
              disabled={quantity <= 1}
            >
              −
            </button>
            <span className="w-6 text-center">{quantity}</span>
            <button
              className="w-8 h-8 text-lg border border-[--color-border] rounded text-[--text-dark] dark:text-[--text-light] disabled:opacity-50"
              onClick={() => updateQuantity(quantity + 1)}
              disabled={quantity >= product.stock}
            >
              +
            </button>
          </div>

          <p className="text-xs mt-1 text-[--color-muted-foreground]">
            Available stock: {product.stock}
          </p>
        </div>
      </div>

      <hr className="my-4 border-[--color-border]" />

      <div className="flex justify-between font-bold text-lg">
        <span>Total:</span>
        <span>₹ {total.toFixed(2)}</span>
      </div>
    </div>
  );
};

export default CheckoutSummary;
