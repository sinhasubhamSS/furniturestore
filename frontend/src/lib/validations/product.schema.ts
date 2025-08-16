import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),

  category: z.string().min(1, "Category is required"),
  isPublished: z.boolean().optional(),

  variants: z
    .array(
      z.object({
        color: z.string().min(1, "Color is required"), // ✅ Made required
        size: z.string().min(1, "Size is required"), // ✅ Made required
        basePrice: z.number().min(0, "Base price must be 0 or more"),
        gstRate: z.number().min(0, "GST rate must be 0 or more"),
        stock: z.number().min(0, "Stock must be 0 or more"),

        // ✅ NEW: Discount fields
        hasDiscount: z.boolean().default(false), // ✅ Remove .optional()
        discountPercent: z
          .number()
          .min(0)
          .max(70, "Discount must be 0-70%")
          .default(0), // ✅ Remove .optional()
        discountValidUntil: z.string().optional(), // Date string from date input

        images: z
          .array(
            z.object({
              url: z.string().url("Invalid image URL"),
              public_id: z.string().min(1, "Public ID is required"), // ✅ Fixed underscore
            })
          )
          .min(1, "At least one image is required"),
      })
    )
    .min(1, "At least one variant is required") // ✅ Made required with minimum 1
    .refine(
      (variants) => {
        // ✅ Unique color-size combinations
        const combinations = variants.map((v) => `${v.color}-${v.size}`);
        return combinations.length === new Set(combinations).size;
      },
      {
        message: "Each color-size combination must be unique",
      }
    ),

  specifications: z
    .array(
      z.object({
        section: z.string().min(1, "Section is required"),
        specs: z
          .array(
            z.object({
              key: z.string().min(1, "Key is required"),
              value: z.string().min(1, "Value is required"),
            })
          )
          .min(1, "At least one spec is required"),
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

// ✅ NEW: Update schema for edit operations
export const updateProductSchema = createProductSchema.partial();

// ✅ NEW: Variant-specific validation with discount logic
export const variantSchema = z
  .object({
    color: z.string().min(1, "Color is required"),
    size: z.string().min(1, "Size is required"),
    basePrice: z.number().min(0, "Base price must be 0 or more"),
    gstRate: z.number().min(0, "GST rate must be 0 or more"),
    stock: z.number().min(0, "Stock must be 0 or more"),

    // Discount fields
    hasDiscount: z.boolean().default(false),
    discountPercent: z
      .number()
      .min(0)
      .max(70, "Discount must be 0-70%")
      .default(0),
    discountValidUntil: z.string().default(new Date(0).toISOString()),

    images: z
      .array(
        z.object({
          url: z.string().url("Invalid image URL"),
          public_id: z.string().min(1, "Public ID is required"),
        })
      )
      .min(1, "At least one image is required"),
  })
  .refine(
    (data) => {
      // ✅ If discount enabled, percentage must be > 0
      if (data.hasDiscount && data.discountPercent <= 0) {
        return false;
      }
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
      // ✅ If discount enabled, end date must be provided and in future
      if (data.hasDiscount) {
        if (!data.discountValidUntil) return false;
        const endDate = new Date(data.discountValidUntil);
        if (endDate <= new Date()) return false;
      }
      return true;
    },
    {
      message:
        "Discount end date is required and must be in the future when discount is enabled",
      path: ["discountValidUntil"],
    }
  );

// ✅ Export types for TypeScript
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type VariantInput = z.infer<typeof variantSchema>;
