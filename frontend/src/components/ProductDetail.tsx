"use client";

import { useGetProductBySlugQuery } from "@/redux/services/user/publicProductApi";
import { useState } from "react";
import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { useAddToCartMutation } from "@/redux/services/user/cartApi";
interface Props {
  slug: string;
}

const ProductDetail = ({ slug }: Props) => {
  const { data: product, isLoading, error } = useGetProductBySlugQuery(slug);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const router = useRouter();
  const [addToCart, { isLoading: isAdding }] = useAddToCartMutation();

  const handleBuyNow = () => {
    router.push(`/checkout?product=${product!._id}`);
  };
  const handleAddToCart = async () => {
    try {
      await addToCart({ productId: product!._id, quantity: 1 }).unwrap();
      // optional toast/alert
    } catch (error: any) {
      console.error("Error adding to cart:", error);
      // show toast or error UI
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[300px]">
        <p className="text-lg text-muted-foreground animate-pulse">
          Loading product...
        </p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex justify-center items-center h-[300px]">
        <p className="text-destructive text-lg">Failed to load product.</p>
      </div>
    );
  }

  const mainImage =
    selectedImage || product.images?.[0]?.url || "/placeholder.png";

  return (
    <div className="w-full mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8 bg-[--color-card] text-[--text-dark] dark:text-[--text-light] p-6 rounded-xl shadow-md border border-[--color-border]">
        {/* Product Images */}
        <div className="flex-1 space-y-4">
          <img
            src={mainImage}
            alt={product.name}
            className="w-full h-96 object-contain rounded-lg border border-[--color-border] bg-white"
          />

          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img.url}
                  alt={`Product ${idx + 1}`}
                  onMouseEnter={() => setSelectedImage(img.url)}
                  onClick={() => setSelectedImage(img.url)}
                  className={`w-20 h-20 object-contain rounded-md border cursor-pointer transition-all duration-200 hover:scale-105 border-[--color-border] ${
                    mainImage === img.url ? "ring-2 ring-[--color-ring]" : ""
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex-1 space-y-4">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="text-muted-foreground text-base">{product.title}</p>
          <p className="text-base">{product.description}</p>

          {/* Price */}
          <div className="text-2xl font-semibold text-[--color-accent]">
            ₹ {product.price.toFixed(2)}
          </div>

          <p className="text-sm text-muted-foreground">
            GST Included: {product.gstRate}%
          </p>

          <p className="text-sm">
            Category:{" "}
            <span className="text-[--text-accent] font-medium">
              {product.category?.name}
            </span>
          </p>

          {/* Stock Badge */}
          <div
            className={`inline-block px-4 py-1 rounded-full text-sm font-medium ${
              product.stock > 0
                ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
            }`}
          >
            {product.stock > 0 ? `In Stock (${product.stock})` : "Out of Stock"}
          </div>

          {/* Buttons */}
          <div className="mt-4 flex gap-4">
            <Button
              onClick={handleAddToCart}
              disabled={isAdding || product.stock <= 0}
              className="bg-[--color-secondary] text-[--text-accent] hover:opacity-90 transition"
            >
              {isAdding ? "Adding..." : "Add to Cart"}
            </Button>

            <Button
              disabled={product.stock <= 0}
              onClick={handleBuyNow}
              className={`bg-[--color-accent] text-white hover:brightness-110 transition ${
                product.stock <= 0 ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Buy Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
