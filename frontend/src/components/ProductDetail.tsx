"use client";

import { useGetProductBySlugQuery } from "@/redux/services/user/publicProductApi";
import { useAddToCartMutation } from "@/redux/services/user/cartApi";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "@/components/ui/Button";

interface Props {
  slug: string;
}

const ProductDetail = ({ slug }: Props) => {
  const { data: product, isLoading, error } = useGetProductBySlugQuery(slug);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [addToCart, { isLoading: isAdding }] = useAddToCartMutation();
  const router = useRouter();

  const handleBuyNow = () => {
    router.push(`/checkout?product=${product!._id}`);
  };

  const handleAddToCart = async () => {
    try {
      await addToCart({ productId: product!._id, quantity: 1 }).unwrap();
    } catch (err) {
      console.error("Add to cart failed:", err);
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
    <div className="w-full px-6 md:px-10 py-10 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row gap-12">
        {/* Left: Images */}
        <div className="flex gap-6">
          {/* Thumbnails */}
          <div className="hidden md:flex flex-col gap-3">
            {product.images.map((img, idx) => (
              <img
                key={idx}
                src={img.url}
                alt={`Product ${idx + 1}`}
                onMouseEnter={() => setSelectedImage(img.url)}
                onClick={() => setSelectedImage(img.url)}
                className={`w-16 h-16 rounded-md object-contain border transition-all duration-300 cursor-pointer hover:scale-105 ${
                  mainImage === img.url ? "ring-2 ring-[--color-accent]" : ""
                }`}
              />
            ))}
          </div>

          {/* Main Image */}
          <div className="border rounded-xl p-4 bg-white shadow-lg max-w-[500px] h-[600px] flex items-center justify-center">
            <img
              src={mainImage}
              alt={product.name}
              className="object-contain h-full w-full"
            />
          </div>
        </div>

        {/* Right: Info */}
        <div className="flex-1 space-y-6 text-[--text-dark] dark:text-[--text-light]">
          {/* Title */}
          <div>
            <h1 className="text-3xl font-semibold">{product.name}</h1>
            <p className="text-muted-foreground text-lg">{product.title}</p>
          </div>

          {/* Price */}
          <div className="space-y-2">
            <div className="text-4xl font-bold text-[--color-accent]">
              ₹ {product.price.toFixed(2)}
            </div>
            <p className="text-sm text-muted-foreground">
              Inclusive of GST ({product.gstRate}%)
            </p>
            <div className="text-sm text-gray-500">
              Category:{" "}
              <span className="font-medium text-[--text-accent]">
                {product.category?.name}
              </span>
            </div>
          </div>

          {/* Description */}
          <p className="text-base leading-relaxed text-foreground/90">
            {product.description}
          </p>

          {/* Stock Status */}
          <div
            className={`inline-block px-5 py-2 rounded-full text-base font-semibold transition ${
              product.stock > 0
                ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
            }`}
          >
            {product.stock > 0 ? `In Stock (${product.stock})` : "Out of Stock"}
          </div>

          {/* Buttons */}
          <div className="mt-6 flex gap-4 flex-wrap">
            <Button
              onClick={handleAddToCart}
              disabled={isAdding || product.stock <= 0}
              className="flex-1 bg-[--color-accent]/10 text-[--color-accent] hover:bg-[--color-accent]/20 transition font-medium py-2.5 px-6 rounded-lg shadow-md disabled:opacity-50"
            >
              {isAdding ? "Adding..." : "Add to Cart"}
            </Button>
            <Button
              onClick={handleBuyNow}
              disabled={product.stock <= 0}
              className="flex-1 bg-[--color-accent] text-white hover:brightness-110 transition font-medium py-2.5 px-6 rounded-lg shadow-md disabled:opacity-50"
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
