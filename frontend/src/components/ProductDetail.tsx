"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGetProductBySlugQuery } from "@/redux/services/user/publicProductApi";
import { useAddToCartMutation } from "@/redux/services/user/cartApi";
import Button from "@/components/ui/Button";
import { FaHeart, FaShippingFast, FaShieldAlt } from "react-icons/fa";
import { Variant } from "@/types/Product";

interface Props {
  slug: string;
}

const ProductDetail = ({ slug }: Props) => {
  const { data: product, isLoading, error } = useGetProductBySlugQuery(slug);
  useEffect(() => {
    if (product) {
      console.log("Transformed Product Data:", product);
    }
  }, [product]);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const [addToCart, { isLoading: isAdding }] = useAddToCartMutation();
  const router = useRouter();

  useEffect(() => {
    if (product && product.variants.length > 0) {
      setSelectedVariant(product.variants[0]);
      setSelectedImage(product.variants[0]?.images?.[0]?.url || null);
      setSelectedColor(product.variants[0].color || null);
    }
  }, [product]);

  useEffect(() => {
    if (product && (selectedColor || selectedSize)) {
      const variant =
        product.variants.find(
          (v) => v.color === selectedColor && v.size === selectedSize
        ) ||
        product.variants.find(
          (v) => v.color === selectedColor || v.size === selectedSize
        ) ||
        product.variants[0];

      if (variant) {
        setSelectedVariant(variant);
        setSelectedImage(variant.images?.[0]?.url || null);
      }
    }
  }, [selectedColor, selectedSize, product]);

  const handleBuyNow = () => {
    if (selectedVariant?._id) {
      router.push(
        `/checkout?product=${selectedVariant._id}&quantity=${quantity}`
      );
    }
  };

  const handleAddToCart = async () => {
    try {
      await addToCart({
        productId: product!._id,
        variantId: selectedVariant!._id,
        quantity,
      }).unwrap();
    } catch (err) {
      console.error("Add to cart failed:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-pulse flex flex-col space-y-4 w-full max-w-6xl">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="bg-gray-200 rounded-lg w-full md:w-1/2 h-[400px]"></div>
            <div className="w-full md:w-1/2 space-y-6">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-4/5"></div>
              <div className="h-12 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <p className="text-destructive text-lg">Failed to load product.</p>
      </div>
    );
  }

  const mainImage =
    selectedImage || selectedVariant?.images?.[0]?.url || "/placeholder.png";

  // Get unique colors and sizes with proper Set conversion
  const colors = [
    ...new Set(product.variants.map((v) => v.color).filter(Boolean)),
  ] as string[];
  const sizes = [
    ...new Set(
      (selectedColor
        ? product.variants
            .filter((v) => v.color === selectedColor)
            .map((v) => v.size)
        : product.variants.map((v) => v.size)
      ).filter(Boolean)
    ),
  ] as string[];

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-10">
      <div className="flex flex-col lg:flex-row gap-10">
        {/* Image Gallery */}
        <div className="w-full lg:w-1/2">
          <div className="sticky top-24">
            {/* Main Image */}
            <div className="bg-white rounded-xl shadow-lg p-4 mb-4 border border-gray-100">
              <img
                src={mainImage}
                alt={product.name}
                className="w-full h-auto max-h-[500px] object-contain rounded-lg"
              />
            </div>

            {/* Thumbnails */}
            <div className="flex flex-wrap gap-3 justify-center mt-4">
              {selectedVariant?.images?.map((img, idx) => (
                <div
                  key={idx}
                  className={`cursor-pointer border-2 rounded-lg overflow-hidden transition-all ${
                    mainImage === img.url
                      ? "border-[--color-accent] scale-105"
                      : "border-transparent"
                  }`}
                  onClick={() => setSelectedImage(img.url)}
                >
                  <img
                    src={img.url}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-16 h-16 object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="w-full lg:w-1/2">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            {/* Title and Category */}
            <div className="mb-4">
              <span className="text-[--color-accent] font-semibold text-sm uppercase tracking-wide">
                {product.category?.name || "Uncategorized"}
              </span>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-1">
                {product.name}
              </h1>
              <p className="text-gray-600 mt-2">{product.title}</p>
            </div>

            {/* Price */}
            <div className="flex items-center justify-between py-4 border-t border-b border-gray-100">
              <div>
                <span className="text-3xl font-bold text-[--color-accent]">
                  ₹
                  {selectedVariant?.price?.toFixed(2) ||
                    selectedVariant?.basePrice}
                </span>
                {selectedVariant?.basePrice !== selectedVariant?.price && (
                  <span className="ml-2 text-gray-500 line-through">
                    ₹{selectedVariant?.basePrice?.toFixed(2)}
                  </span>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  Inclusive of GST ({selectedVariant?.gstRate}%)
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 rounded-full hover:bg-gray-100">
                  <FaHeart className="text-gray-500 hover:text-red-500" />
                </button>
              </div>
            </div>

            {/* Variant Selectors */}
            <div className="py-6 space-y-6">
              {/* Color Selector */}
              {colors.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    Color
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {colors.map((color, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedColor(color)}
                        className={`px-4 py-2 rounded-full border transition-all ${
                          selectedColor === color
                            ? "bg-[--color-accent]/10 border-[--color-accent] font-medium"
                            : "border-gray-300"
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selector */}
              {sizes.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    Size
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {sizes.map((size, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedSize(size)}
                        className={`w-14 h-14 flex items-center justify-center rounded-lg border transition-all ${
                          selectedSize === size
                            ? "bg-[--color-accent] text-white border-[--color-accent]"
                            : "border-gray-300"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="flex items-center">
                <h3 className="text-lg font-medium text-gray-900 mr-4">
                  Quantity
                </h3>
                <div className="flex items-center border border-gray-300 rounded-md">
                  <button
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="px-4 py-2">{quantity}</span>
                  <button
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100"
                    onClick={() => setQuantity((q) => q + 1)}
                    disabled={quantity >= (selectedVariant?.stock || 1)}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Stock Status */}
            <div
              className={`mb-6 py-3 px-4 rounded-lg ${
                selectedVariant?.stock && selectedVariant.stock > 0
                  ? "bg-green-50 text-green-800"
                  : "bg-red-50 text-red-800"
              }`}
            >
              <span className="font-medium">
                {selectedVariant?.stock && selectedVariant.stock > 0
                  ? `In Stock (${selectedVariant.stock} available)`
                  : "Out of Stock"}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleAddToCart}
                disabled={isAdding || !selectedVariant?.stock}
                className="flex-1 bg-gray-900 text-white hover:bg-gray-800 py-3 rounded-lg transition font-medium flex items-center justify-center gap-2"
              >
                {isAdding ? "Adding..." : "Add to Cart"}
              </Button>
              <Button
                onClick={handleBuyNow}
                disabled={!selectedVariant?.stock}
                className="flex-1 bg-[--color-accent] text-white hover:bg-[--color-accent-dark] py-3 rounded-lg transition font-medium"
              >
                Buy Now
              </Button>
            </div>

            {/* Additional Info */}
            <div className="mt-8 pt-6 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <FaShippingFast className="text-xl text-[--color-accent]" />
                <div>
                  <h4 className="font-medium">Free Shipping</h4>
                  <p className="text-sm text-gray-500">All over India</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FaShieldAlt className="text-xl text-[--color-accent]" />
                <div>
                  <h4 className="font-medium">Secure Payment</h4>
                  <p className="text-sm text-gray-500">100% Protected</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-[--color-accent] w-6 h-6 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">7</span>
                </div>
                <div>
                  <h4 className="font-medium">Easy Returns</h4>
                  <p className="text-sm text-gray-500">7 Days Policy</p>
                </div>
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Product Details
            </h2>

            <p className="text-gray-700 mb-6 leading-relaxed">
              {product.description}
            </p>

            {/* Specifications */}
            {product.specifications && product.specifications.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Specifications
                </h3>
                {product.specifications.map((section, idx) => (
                  <div key={idx} className="mb-4">
                    <h4 className="text-lg font-medium text-gray-800 mb-2">
                      {section.section}
                    </h4>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {section.specs.map((spec, i) => (
                        <li
                          key={i}
                          className="flex justify-between border-b border-gray-100 pb-2"
                        >
                          <span className="text-gray-600">{spec.key}</span>
                          <span className="text-gray-900 font-medium">
                            {spec.value}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {/* Measurements */}
            {product.measurements && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Measurements
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {product.measurements.width && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-gray-600 text-sm">Width</p>
                      <p className="font-medium">
                        {product.measurements.width} cm
                      </p>
                    </div>
                  )}
                  {product.measurements.height && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-gray-600 text-sm">Height</p>
                      <p className="font-medium">
                        {product.measurements.height} cm
                      </p>
                    </div>
                  )}
                  {product.measurements.depth && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-gray-600 text-sm">Depth</p>
                      <p className="font-medium">
                        {product.measurements.depth} cm
                      </p>
                    </div>
                  )}
                  {product.measurements.weight && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-gray-600 text-sm">Weight</p>
                      <p className="font-medium">
                        {product.measurements.weight} kg
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Warranty & Disclaimer */}
            <div className="space-y-4">
              {product.warranty && (
                <div>
                  <h4 className="font-medium text-gray-900">Warranty</h4>
                  <p className="text-gray-600">{product.warranty}</p>
                </div>
              )}
              {product.disclaimer && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-500 text-sm italic">
                    {product.disclaimer}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
