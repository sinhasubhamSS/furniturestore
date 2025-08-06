import { Types } from "mongoose";
import { z } from "zod";

// ✅ ObjectId validator
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

// ✅ Image schema
const imageSchema = z.object({
  url: z.string().url({ message: "Invalid image URL" }),
  public_id: z.string().min(1, "public_id is required"),
});

// ✅ Variant schema
const variantSchema = z.object({
  sku: z.string().min(1, "SKU is required"),
  color: z.string().min(1, "Color is required"),
  size: z.string().min(1, "Size is required"),
  basePrice: z.preprocess(
    (val) => Number(val),
    z.number().positive("Base price must be positive")
  ),
  gstRate: z.preprocess(
    (val) => Number(val),
    z.number().min(0).max(100, "GST must be 0-100%")
  ),
  stock: z.preprocess(
    (val) => Number(val),
    z.number().int().nonnegative().default(0)
  ),
  images: z.array(imageSchema).min(1, "At least one image per variant"),
});

// ✅ Structured Specification Schema
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

// ✅ Measurements schema
const measurementsSchema = z.object({
  width: z.number().optional(),
  height: z.number().optional(),
  depth: z.number().optional(),
  weight: z.number().optional(),
});

// ✅ Create Product Schema (Final Corrected Version)
export const createProductSchema = z.object({
  // Core product information
  name: z.string().min(1, "Product name is required"),
  title: z.string().min(1, "Product title is required"),
  description: z.string().min(1, "Description is required"),
  category: objectId,

  // Variants - required with at least one
  variants: z.array(variantSchema).min(1, "At least one variant is required"),

  // Optional metadata
  specifications: z.array(specificationSchema).optional(),
  measurements: measurementsSchema.optional(),
  warranty: z.string().optional(),
  disclaimer: z.string().optional(),

  // Auto-generated fields (should not be provided)
  slug: z
    .string()
    .optional()
    .refine((val) => !val, {
      message: "Slug is auto-generated and should not be provided",
    }),
  isPublished: z.boolean().optional().default(false),
});

// ✅ Update Schema - Partial but with variant constraints
export const updateProductSchema = createProductSchema
  .partial()
  .refine((data) => {
    // Prevent removing all variants
    if (data.variants?.length === 0) return false;
    return true;
  }, "Cannot remove all variants");
