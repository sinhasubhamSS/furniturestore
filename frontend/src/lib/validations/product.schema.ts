// lib/validations/product.schema.ts
import { z } from "zod";

export const variantSchema = z
  .object({
    color: z.string().min(1, "Color is required"),
    // size is optional now (many products don't have size)
    size: z.string().optional(),

    // Source-of-truth: basePrice must be > 0 for correct tax calculation
    basePrice: z
      .number({
        required_error: "Base price is required",
        invalid_type_error: "Base price must be a number",
      })
      .min(0.01, "Base price must be greater than 0"),

    // gstRate required (0 is allowed)
    gstRate: z
      .number({
        required_error: "GST rate is required",
        invalid_type_error: "GST rate must be a number",
      })
      .min(0, "GST rate must be 0 or more"),

    // Optional marketing/fallback fields (frontend/admin can provide)
    listingPrice: z.number().min(0).optional(), // MRP (optional)
    finalSellingPrice: z.number().min(0).optional(), // input-only: merchant may provide final price

    // stock/reserved
    stock: z.number().int().min(0, "Stock must be 0 or more"),
    reservedStock: z.number().int().min(0).optional(),

    // Computed (optional on input)
    gstAmount: z.number().optional(),
    sellingPrice: z.number().optional(),

    // legacy / UI helpers
    hasDiscount: z.boolean().default(false),
    discountPercent: z
      .number()
      .min(0)
      .max(99, "Discount must be between 0-99%")
      .default(0),
    // Keep discountValidUntil optional so empty => treated as permanent by backend
    discountValidUntil: z.string().optional(),
    discountedPrice: z.number().optional().default(0),

    // images (uploader ensures public_id present)
    images: z
      .array(
        z.object({
          url: z.string().url("Invalid image URL"),
          public_id: z.string().min(1, "Public ID is required"),
          thumbSafe: z.string().optional(),
          isPrimary: z.boolean().optional(),
        })
      )
      .min(1, "At least one image is required"),
  })
  .refine(
    (data) => {
      if (
        data.hasDiscount &&
        (!data.discountPercent || data.discountPercent <= 0)
      )
        return false;
      return true;
    },
    {
      message:
        "Discount percentage must be greater than 0 when discount is enabled",
      path: ["discountPercent"],
    }
  )
  .refine(
    (data) => {
      if (data.hasDiscount && data.discountValidUntil) {
        const endDate = new Date(data.discountValidUntil);
        return endDate > new Date();
      }
      return true;
    },
    {
      message: "Discount end date must be in the future when provided",
      path: ["discountValidUntil"],
    }
  );

export const createProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  // title optional to match ProductForm
  title: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  isPublished: z.boolean().optional(),

  // optional top-level image (frontend expects it)
  image: z.string().url("Invalid image URL").optional(),

  // optional rep overrides (admin can supply; backend will recompute/override if needed)
  repImage: z.string().optional(),
  repThumbSafe: z.string().optional(),
  repPrice: z.number().optional(),
  repDiscountedPrice: z.number().optional(),
  repInStock: z.boolean().optional(),

  variants: z
    .array(variantSchema)
    .min(1, "At least one variant is required")
    .refine(
      (variants) => {
        const combos = variants.map((v) => `${v.color}-${v.size ?? ""}`);
        return combos.length === new Set(combos).size;
      },
      { message: "Each color-size combination must be unique" }
    ),
  specifications: z
    .array(
      z.object({
        section: z.string().min(1),
        specs: z
          .array(
            z.object({
              key: z.string().min(1),
              value: z.string().min(1),
            })
          )
          .min(1),
      })
    )
    .optional(),
  measurements: z
    .object({
      width: z.number().optional(),
      height: z.number().optional(),
      depth: z.number().optional(),
      weight: z.number().optional(),
    })
    .optional(),
  warranty: z.string().optional(),
  disclaimer: z.string().optional(),
});

export const updateProductSchema = createProductSchema.partial();

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type VariantInput = z.infer<typeof variantSchema>;
