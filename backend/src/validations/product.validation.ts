import { Types } from "mongoose";
import { z } from "zod";

// ✅ ObjectId validator (same)
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

// ✅ Image schema (same)
const imageSchema = z.object({
  url: z.string().url({ message: "Invalid image URL" }),
  public_id: z.string().min(1, "public_id is required"), // ✅ Fixed underscore
});

// ✅ MINIMAL UPDATE: Variant schema + discount (just 3 lines added)
const variantSchema = z
  .object({
    sku: z.string().min(1, "SKU is required").optional(),
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

    // ✅ JUST THESE 3 LINES ADDED:
    hasDiscount: z.boolean().default(false),
    discountPercent: z.coerce.number().min(0).max(70).default(0),
    discountValidUntil: z.coerce.date().default(new Date(0)),

    images: z.array(imageSchema).min(1, "At least one image per variant"),
  })
  .refine(
    (data) => {
      // If discount is enabled, percent must be > 0
      if (data.hasDiscount && data.discountPercent <= 0) {
        return false;
      }
      return true;
    },
    {
      message:
        "Discount percent must be greater than 0 when discount is enabled",
      path: ["discountPercent"],
    }
  )
  .refine(
    (data) => {
      // If discount is enabled, end date should be in future
      if (
        data.hasDiscount &&
        data.discountValidUntil &&
        data.discountValidUntil <= new Date()
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Discount end date must be in the future",
      path: ["discountValidUntil"],
    }
  );

// ✅ Specification schema (same)
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

// ✅ Measurements schema (same)
const measurementsSchema = z.object({
  width: z.number().optional(),
  height: z.number().optional(),
  depth: z.number().optional(),
  weight: z.number().optional(),
});

// ✅ Create Product Schema (same)
export const createProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  title: z.string().min(1, "Product title is required"),
  description: z.string().min(1, "Description is required"),
  category: objectId,
  variants: z.array(variantSchema).min(1, "At least one variant is required"),
  specifications: z.array(specificationSchema).optional(),
  measurements: measurementsSchema.optional(),
  warranty: z.string().optional(),
  disclaimer: z.string().optional(),
  slug: z
    .string()
    .optional()
    .refine((val) => !val, {
      message: "Slug is auto-generated and should not be provided",
    }),
  isPublished: z.boolean().optional().default(false),
});

// ✅ Update Schema (same)
export const updateProductSchema = createProductSchema
  .partial()
  .refine((data) => {
    if (data.variants?.length === 0) return false;
    return true;
  }, "Cannot remove all variants");

// ✅ Export types
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
