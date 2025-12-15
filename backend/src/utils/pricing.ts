export type PricingResult = {
  base: number;
  gstAmount: number;
  listingPrice: number;
  sellingPrice: number;
  savings: number;
  discountPercent: number;
};

const round2 = (n: number) => Math.round(n * 100) / 100;

export function calcDiscountPercent(
  listingPrice: number,
  sellingPrice: number
): number {
  if (!listingPrice || listingPrice <= sellingPrice) return 0;
  const raw = ((listingPrice - sellingPrice) / listingPrice) * 100;
  return Math.round(raw);
}

function normalizeDiscount(listingPrice: number, sellingPrice: number) {
  if (listingPrice <= sellingPrice) {
    return {
      listingPrice: sellingPrice,
      savings: 0,
      discountPercent: 0,
    };
  }

  const savings = round2(listingPrice - sellingPrice);
  const discountPercent = calcDiscountPercent(listingPrice, sellingPrice);

  return { listingPrice, savings, discountPercent };
}

export function computeVariantFromBase(
  basePriceInput: number,
  gstRate: number,
  listingPriceInput?: number | null
): PricingResult {
  const base = round2(basePriceInput || 0);
  const gstAmount = round2(base * ((gstRate || 0) / 100));
  const sellingPrice = round2(base + gstAmount);

  const rawListing =
    typeof listingPriceInput === "number" && listingPriceInput > 0
      ? round2(listingPriceInput)
      : sellingPrice;

  const { listingPrice, savings, discountPercent } = normalizeDiscount(
    rawListing,
    sellingPrice
  );

  return {
    base,
    gstAmount,
    listingPrice,
    sellingPrice,
    savings,
    discountPercent,
  };
}

export function computeVariantFromSellingPrice(
  finalSellingInput: number,
  gstRate: number,
  listingPriceInput?: number | null
): PricingResult {
  const gstFactor = 1 + (gstRate || 0) / 100;
  const sellingCandidate = round2(finalSellingInput || 0);
  const base = round2(sellingCandidate / gstFactor);
  const gstAmount = round2(base * ((gstRate || 0) / 100));
  const sellingPrice = round2(base + gstAmount);

  const rawListing =
    typeof listingPriceInput === "number" && listingPriceInput > 0
      ? round2(listingPriceInput)
      : sellingPrice;

  const { listingPrice, savings, discountPercent } = normalizeDiscount(
    rawListing,
    sellingPrice
  );

  return {
    base,
    gstAmount,
    listingPrice,
    sellingPrice,
    savings,
    discountPercent,
  };
}
