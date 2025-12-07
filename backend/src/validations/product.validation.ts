// validations/product.validation.ts
import { Types } from "mongoose";
import { z } from "zod";

// ObjectId preprocess -> Types.ObjectId
const objectId = z.preprocess(
  (val) => {
    if (typeof val === "string" && Types.ObjectId.isValid(val)) {
      return new Types.ObjectId(val);
    }
    return val;
  },
  z.custom<Types.ObjectId>((val) => val instanceof Types.ObjectId, {
    message: "Invalid ObjectId",
  })
);

// helper: coerce empty/null/"" to undefined, then to number
const optionalNumber = z.preprocess((val) => {
  if (val === "" || val === null || val === undefined) return undefined;
  const n = Number(val);
  return Number.isNaN(n) ? val : n;
}, z.number().optional());

// ✅ Image schema: include thumbSafe & isPrimary
const imageSchema = z.object({
  url: z.string().url({ message: "Invalid image URL" }),
  public_id: z.string().min(1, "public_id is required"),
  thumbSafe: z.string().url().optional(),
  isPrimary: z.boolean().optional(),
});

// Variant schema
const variantSchema = z
  .object({
    sku: z.string().min(1, "SKU is required").optional(),
    color: z.string().min(1, "Color is required"),
    size: z.string().min(1, "Size is required"),
    basePrice: z.preprocess(
      (v) => Number(v),
      z.number().positive("Base price must be positive")
    ),
    gstRate: z.preprocess(
      (v) => Number(v),
      z.number().min(0).max(100, "GST must be 0-100%")
    ),
    stock: z.preprocess(
      (v) => Number(v),
      z.number().int().nonnegative().default(0)
    ),

    // discount fields (allow missing/false)
    hasDiscount: z.boolean().optional().default(false),
    discountPercent: z.preprocess(
      (v) => (v === "" || v === null || v === undefined ? 0 : Number(v)),
      z.number().min(0).max(70).optional().default(0)
    ),

    // NOTE: discountValidUntil is OPTIONAL now and we DO NOT enforce future-date here.
    // Backend business logic can still enforce/inspect it if you want later.
    discountValidUntil: z.preprocess((v) => {
      if (!v) return undefined;
      const d = new Date(v as any);
      return isNaN(d.getTime()) ? v : d;
    }, z.date().optional()),

    images: z.array(imageSchema).min(1, "At least one image per variant"),
    listingPrice: z.number().optional(),
    finalSellingPrice: z.number().optional(),
  })
  .refine(
    (data) => {
      if (
        data.hasDiscount &&
        (data.discountPercent === undefined || data.discountPercent <= 0)
      ) {
        return false;
      }
      return true;
    },
    {
      message:
        "Discount percent must be greater than 0 when discount is enabled",
      path: ["discountPercent"],
    }
  );

// specification schema
const specificationSchema = z.object({
  section: z.string().min(1, "Section name is required"),
  specs: z
    .array(
      z.object({
        key: z.string().min(1, "Spec key is required"),
        value: z.string().min(1, "Spec value is required"),
      })
    )
    .min(1, "At least one spec is required"),
});

// measurements: use optionalNumber for fields
const measurementsSchema = z.object({
  width: optionalNumber,
  height: optionalNumber,
  depth: optionalNumber,
  weight: optionalNumber,
});

// Create Product
export const createProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  title: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  category: objectId,
  variants: z.array(variantSchema).min(1, "At least one variant is required"),
  specifications: z.array(specificationSchema).optional(),
  measurements: measurementsSchema.optional(),
  warranty: z.string().optional(),
  disclaimer: z.string().optional(),
  slug: z.string().optional(),
  isPublished: z.boolean().optional().default(false),
});

export const updateProductSchema = createProductSchema.partial().refine(
  (data) => {
    if (
      data.variants &&
      Array.isArray(data.variants) &&
      data.variants.length === 0
    )
      return false;
    return true;
  },
  {
    message: "Cannot remove all variants",
  }
);

// types
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
