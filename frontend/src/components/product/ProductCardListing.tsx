// components/product/ProductCardListing.tsx
"use client";

import React, { memo, useMemo } from "react";
import Image from "next/image";
import { FaHeart, FaRegHeart, FaShoppingCart } from "react-icons/fa";
import type { DisplayProduct } from "@/types/Product";
import { useWishlistManager } from "@/hooks/useWishlistManger";

interface ProductCardListingProps {
  product: DisplayProduct;
}

const PLACEHOLDER = "/placeholder.jpg";

const ProductCardListing = memo(
  ({ product }: ProductCardListingProps) => {
    const variant = (product.variants && product.variants[0]) ?? ({} as any);

    const {
      isInWishlist,
      addToWishlist,
      removeFromWishlist,
      isProductLoading,
    } = useWishlistManager();

    const isProductInWishlist = useMemo(
      () => isInWishlist(product._id),
      [isInWishlist, product._id]
    );

    const isLoading = useMemo(
      () => isProductLoading(product._id),
      [isProductLoading, product._id]
    );

    const handleWishlist = async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      try {
        if (isProductInWishlist) await removeFromWishlist(product._id);
        else await addToWishlist(product._id);
      } catch (err) {
        console.error("Wishlist action failed:", err);
      }
    };

    const { imgSrc, blurDataURL, listingVal, sellingVal, priceLabel } =
      useMemo(() => {
        const imgFromProduct =
          typeof (product as any).image === "string" && (product as any).image
            ? (product as any).image
            : null;

        const repThumb =
          typeof (product as any).repThumbSafe === "string" &&
          (product as any).repThumbSafe
            ? (product as any).repThumbSafe
            : null;

        const repImage =
          typeof (product as any).repImage === "string" &&
          (product as any).repImage
            ? (product as any).repImage
            : null;

        const maybeFirst = variant?.images?.[0];
        const firstUrl =
          typeof maybeFirst === "string" ? maybeFirst : maybeFirst?.url;
        const variantImage =
          typeof firstUrl === "string" && firstUrl ? firstUrl : null;

        const src = imgFromProduct || repImage || variantImage || PLACEHOLDER;
        const blur =
          repThumb ||
          (imgFromProduct === null && repImage === null ? variantImage : null);

        // PRICING: prefer denorm rep fields (repPrice = listingPrice, repDiscountedPrice = sellingPrice)
        const repPriceField = (product as any).repPrice;
        const repDiscountedField = (product as any).repDiscountedPrice;

        // If rep fields absent calculate from variants
        let variantListingPrices: number[] = [];
        let variantSellingPrices: number[] = [];

        if (Array.isArray(product.variants) && product.variants.length) {
          product.variants.forEach((v: any) => {
            const lp =
              typeof v.listingPrice === "number"
                ? v.listingPrice
                : typeof v.price === "number"
                ? v.price
                : null;
            const sp =
              typeof v.sellingPrice === "number"
                ? v.sellingPrice
                : typeof v.discountedPrice === "number"
                ? v.discountedPrice
                : null;

            if (lp != null && Number.isFinite(lp))
              variantListingPrices.push(lp);
            if (sp != null && Number.isFinite(sp))
              variantSellingPrices.push(sp);
          });
        }

        const variantMinListing =
          variantListingPrices.length > 0
            ? Math.min(...variantListingPrices)
            : null;
        const variantMaxListing =
          variantListingPrices.length > 0
            ? Math.max(...variantListingPrices)
            : null;

        const listingVal =
          typeof repPriceField !== "undefined"
            ? Number(repPriceField)
            : variantMinListing ?? (product as any).price ?? null;

        const sellingVal =
          typeof repDiscountedField !== "undefined"
            ? Number(repDiscountedField)
            : (product as any).lowestDiscountedPrice ??
              (variantSellingPrices.length > 0
                ? Math.min(...variantSellingPrices)
                : null);

        // label logic
        let priceLabel = "";
        if (
          variantMinListing != null &&
          variantMaxListing != null &&
          variantMaxListing > variantMinListing &&
          typeof repPriceField === "undefined"
        ) {
          priceLabel = `From ₹${variantMinListing.toFixed(0)}`;
        } else if (sellingVal != null) {
          priceLabel = `₹${Number(sellingVal).toFixed(0)}`;
        } else if (listingVal != null) {
          priceLabel = `₹${Number(listingVal).toFixed(0)}`;
        } else {
          priceLabel = "—";
        }

        return {
          imgSrc: src,
          blurDataURL: blur || undefined,
          listingVal,
          sellingVal,
          priceLabel,
        };
      }, [product, variant]);

    // discount detection for badge/strike-through
    const originalPrice = listingVal ?? null;
    const finalPrice = sellingVal ?? listingVal ?? null;
    const hasDiscount =
      originalPrice != null &&
      finalPrice != null &&
      Number(finalPrice) < Number(originalPrice);
    const discountPercent = hasDiscount
      ? Math.round(
          ((Number(originalPrice) - Number(finalPrice)) /
            Number(originalPrice)) *
            100
        )
      : 0;

    const categoryName =
      typeof product.category === "string" ? "" : product.category?.name ?? "";

    return (
      <div
        className="group relative flex flex-col h-80 cursor-pointer transition-transform duration-200 rounded-md"
        style={{
          background: "var(--color-card)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}
      >
        <div
          className="relative flex items-center justify-center overflow-hidden"
          style={{
            height: "56%",
            background: "var(--color-primary)",
          }}
        >
          <Image
            src={imgSrc}
            alt={product.name}
            width={400}
            height={320}
            style={{ objectFit: "contain", padding: "1rem" }}
            priority={false}
            placeholder={blurDataURL ? "blur" : "empty"}
            blurDataURL={blurDataURL}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 200px"
          />

          {hasDiscount && discountPercent > 0 && (
            <div
              className="absolute top-3 left-3 text-xs font-semibold px-2 py-0.5 rounded"
              style={{
                background: "var(--color-secondary)",
                color: "var(--text-light)",
              }}
            >
              {discountPercent}% OFF
            </div>
          )}

          <button
            onClick={handleWishlist}
            disabled={isLoading}
            aria-label={
              isProductInWishlist ? "Remove from wishlist" : "Add to wishlist"
            }
            aria-pressed={isProductInWishlist}
            className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center z-10 bg-[var(--color-card)] shadow-sm"
          >
            {isLoading ? (
              <div
                className="animate-spin w-4 h-4 rounded-full"
                style={{
                  border: "2px solid var(--color-accent)",
                  borderTopColor: "transparent",
                }}
              />
            ) : isProductInWishlist ? (
              <FaHeart style={{ color: "var(--color-accent)" }} />
            ) : (
              <FaRegHeart style={{ color: "var(--text-accent)" }} />
            )}
          </button>

          <div
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
            style={{
              background:
                "linear-gradient(180deg, rgba(0,0,0,0.0), rgba(0,0,0,0.15))",
            }}
          >
            <div className="pointer-events-auto flex gap-2">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.info("Quick view:", product._id);
                }}
                className="px-3 py-1 rounded bg-[rgba(0,0,0,0.6)] text-white text-sm hover:opacity-90"
              >
                Quick view
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.info("Add to cart:", product._id);
                }}
                className="px-3 py-1 rounded bg-[var(--color-accent)] text-white text-sm hover:opacity-90 flex items-center gap-2"
              >
                <FaShoppingCart /> Add
              </button>
            </div>
          </div>
        </div>

        <div
          className="flex-1 flex flex-col justify-between px-3 py-2"
          style={{ background: "var(--color-card-secondary)" }}
        >
          <div>
            <h3
              className="text-sm font-semibold line-clamp-2 mb-1"
              style={{ color: "var(--color-foreground)" }}
            >
              {product.name}
            </h3>
            {categoryName && (
              <div
                className="text-xs mb-1"
                style={{ color: "var(--text-accent)" }}
              >
                {categoryName}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-baseline gap-2">
              {priceLabel !== "—" ? (
                <>
                  <span
                    className="text-base font-bold"
                    style={{ color: "var(--color-accent)" }}
                  >
                    {priceLabel}
                  </span>

                  {hasDiscount && originalPrice != null && (
                    <span
                      className="text-xs line-through"
                      style={{ color: "var(--text-accent)" }}
                    >
                      ₹{Number(originalPrice).toFixed(0)}
                    </span>
                  )}
                </>
              ) : (
                <span
                  className="text-base font-bold"
                  style={{ color: "var(--color-accent)" }}
                >
                  ₹
                  {originalPrice != null
                    ? Number(originalPrice).toFixed(0)
                    : "—"}
                </span>
              )}
            </div>

            <div
              className="ml-auto text-xs font-semibold"
              style={{ color: "var(--text-accent)" }}
            >
              {product.repInStock ? "In stock" : "Free delivery"}
            </div>
          </div>
        </div>

        <style jsx>{`
          .group:hover {
            box-shadow: 0 8px 18px rgba(0, 0, 0, 0.08);
            transform: translateY(-4px);
          }
        `}</style>
      </div>
    );
  },
  (prev, next) =>
    prev.product._id === next.product._id &&
    ((prev.product as any).image ??
      (prev.product as any).repImage ??
      (prev.product as any).repThumbSafe) ===
      ((next.product as any).image ??
        (next.product as any).repImage ??
        (next.product as any).repThumbSafe) &&
    (prev.product as any).repPrice === (next.product as any).repPrice &&
    (prev.product as any).repDiscountedPrice ===
      (next.product as any).repDiscountedPrice &&
    prev.product.repInStock === next.product.repInStock
);

ProductCardListing.displayName = "ProductCardListing";
export default ProductCardListing;
