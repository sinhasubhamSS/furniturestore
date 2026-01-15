"use client";

import Link from "next/link";
import { useWishlist } from "@/hooks/useWishlist";
import ProductCardListing from "./ProductCardListing";
import ProductCardSkeleton from "./ProductCardSkeleton";
import type { DisplayProduct } from "@/types/Product";

export default function ProductsGridClient({
  products,
  isLoading = false,
}: {
  products: DisplayProduct[];
  isLoading?: boolean;
}) {
  const { isReady, isInWishlist, toggleWishlist, isMutating } = useWishlist();

  const gridClass =
    "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 px-4";

  if (isLoading) {
    return (
      <div className={gridClass}>
        {Array.from({ length: 10 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className={gridClass}>
      {products.map((product) => {
        const productId = String(product._id);
        const variantId = product.primaryVariantId
          ? String(product.primaryVariantId)
          : null;

        const canWishlist = Boolean(variantId);
        const isWishlisted =
          isReady && variantId ? isInWishlist(productId, variantId) : false;

        const handleWishlist = async (e: React.MouseEvent) => {
          e.preventDefault();
          e.stopPropagation();
          if (!variantId) return;
          await toggleWishlist(productId, variantId);
        };

        return (
          <Link
            key={productId}
            href={`/products/${product.slug}`}
            className="block h-full"
          >
            <ProductCardListing
              product={product}
              isWishlisted={isWishlisted}
              canWishlist={canWishlist}
              disabled={!isReady || isMutating}
              onToggleWishlist={handleWishlist}
            />
          </Link>
        );
      })}
    </div>
  );
}
