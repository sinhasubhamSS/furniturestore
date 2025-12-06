// utils/pricing.ts
export type PricingResult = {
  base: number; // taxable value (before GST)
  gstAmount: number;
  listingPrice: number; // marketing MRP (display)
  sellingPrice: number; // final customer pays (inclusive of GST)
  savings: number; // listingPrice - sellingPrice
  discountPercent: number; // integer percent (rounded), derived from listingPrice vs sellingPrice
};

/** Round to 2 decimals */
const round2 = (n: number) => Math.round(n * 100) / 100;

/** safe percent calculation: (listing - selling) / listing * 100 */
export function calcDiscountPercent(
  listingPrice: number,
  sellingPrice: number
): number {
  if (!listingPrice || listingPrice <= 0) return 0;
  const raw = ((listingPrice - sellingPrice) / listingPrice) * 100;
  // clamp and round to nearest integer (you may want 1 decimal instead, adjust if needed)
  const pct = Math.round(Math.max(0, raw));
  return pct;
}

/**
 * Compute pricing when admin provides basePrice (canonical)
 */
export function computeVariantFromBase(
  basePriceInput: number,
  gstRate: number,
  listingPriceInput?: number | null
): PricingResult {
  const base = round2(basePriceInput || 0);
  const gstAmount = round2(base * ((gstRate || 0) / 100));
  const sellingPrice = round2(base + gstAmount);

  const listingPrice =
    typeof listingPriceInput === "number" && listingPriceInput > 0
      ? round2(listingPriceInput)
      : sellingPrice;

  const savings = round2(listingPrice - sellingPrice);
  const discountPercent = calcDiscountPercent(listingPrice, sellingPrice);

  return {
    base,
    gstAmount,
    listingPrice,
    sellingPrice,
    savings,
    discountPercent,
  };
}

/**
 * Compute pricing when admin provides final selling price (inclusive of GST)
 * Useful for merchant UX: they enter final price, we derive taxable base.
 */
export function computeVariantFromSellingPrice(
  finalSellingInput: number,
  gstRate: number,
  listingPriceInput?: number | null
): PricingResult {
  const gstFactor = 1 + (gstRate || 0) / 100;
  const sellingPriceCandidate = round2(finalSellingInput || 0);
  const base = round2(sellingPriceCandidate / gstFactor);
  const gstAmount = round2(base * ((gstRate || 0) / 100));
  // recompute sellingPrice from base+gst to avoid fractional mismatch
  const sellingPrice = round2(base + gstAmount);

  const listingPrice =
    typeof listingPriceInput === "number" && listingPriceInput > 0
      ? round2(listingPriceInput)
      : sellingPrice;

  const savings = round2(listingPrice - sellingPrice);
  const discountPercent = calcDiscountPercent(listingPrice, sellingPrice);

  return {
    base,
    gstAmount,
    listingPrice,
    sellingPrice,
    savings,
    discountPercent,
  };
}
