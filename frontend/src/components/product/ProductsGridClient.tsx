"use client";

import Link from "next/link";
import { useWishlist } from "@/hooks/useWishlist";
import ProductCardListing from "./ProductCardListing";
import type { DisplayProduct } from "@/types/Product";

export default function ProductsGridClient({
  products,
}: {
  products: DisplayProduct[];
}) {
  const { isReady, isInWishlist, toggleWishlist, isMutating } = useWishlist();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-[1px] px-4">
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
          <Link key={productId} href={`/products/${product.slug}`}>
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
