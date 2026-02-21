export const BUSINESS_RULES = {
  // Return Policy
  RETURN_WINDOW_DAYS: 7,

  // Payment Rules
  ADVANCE_PAYMENT_THRESHOLD: 15000,
  ADVANCE_PAYMENT_PERCENTAGE: 0.1,

  // Fees
  PACKAGING_FEE: 29,
  COD_HANDLING_FEE: 99,

  // Defaults
  DEFAULT_PRODUCT_WEIGHT: 1,

  // Pagination
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,

  // Order Cancellation
  ORDER_CANCELLATION_WINDOW_HOURS: 12,
} as const;

export const RETURN_REASONS = {
  DEFECTIVE: "Product is defective or damaged",
  WRONG_ITEM: "Received wrong item",
  SIZE_ISSUE: "Size doesn't fit",
  NOT_AS_DESCRIBED: "Product not as described",
  CHANGED_MIND: "Changed my mind",
  LATE_DELIVERY: "Delivered too late",
  DUPLICATE_ORDER: "Ordered by mistake",
  BETTER_PRICE: "Found better price elsewhere",
} as const;
export const DEFAULT_EMAIL_FROM = "Suvidha Wood <no-reply@suvidhawood.com>";
