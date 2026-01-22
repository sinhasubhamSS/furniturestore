type VariantAttributes = {
  finish?: string;
  size?: string;
  seating?: string;
  configuration?: string;
};

export const generateSKU = (
  baseName: string,
  attributes?: VariantAttributes,
) => {
  const sanitize = (str: string) =>
    str.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

  // Product code (BED, SOF, TBL)
  const productCode = sanitize(baseName).slice(0, 3) || "PRD";

  // Finish code (WAL, TEA, NAT)
  const finishCode = attributes?.finish
    ? sanitize(attributes.finish).slice(0, 3)
    : "FIN";

  // Variant code (KING / 3S / 311)
  const variantCode = attributes?.size
    ? sanitize(attributes.size)
    : attributes?.seating
      ? sanitize(attributes.seating).replace("SEATER", "S")
      : attributes?.configuration
        ? sanitize(attributes.configuration)
        : "STD";

  // Random for uniqueness
  const uniquePart = Math.random().toString(36).substring(2, 6).toUpperCase();

  return `${productCode}-${variantCode}-${finishCode}-${uniquePart}`;
};
