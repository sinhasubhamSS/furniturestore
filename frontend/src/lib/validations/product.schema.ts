// lib/validations/product.schema.ts
import { z } from "zod";

export const variantSchema = z
  .object({
    color: z.string().min(1, "Color is required"),
    size: z.string().min(1, "Size is required"),
    basePrice: z.number().min(0, "Base price must be 0 or more"),
    gstRate: z.number().min(0, "GST rate must be 0 or more"),
    stock: z.number().int().min(0, "Stock must be 0 or more"),
    hasDiscount: z.boolean().default(false),
    discountPercent: z
      .number()
      .min(0)
      .max(70, "Discount must be 0-70%")
      .default(0),
    // Keep discountValidUntil optional so empty => treated as permanent by backend
    discountValidUntil: z.string().optional(),
    discountedPrice: z.number().optional().default(0),
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
      if (data.hasDiscount && data.discountPercent <= 0) return false;
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
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  isPublished: z.boolean().optional(),
  variants: z
    .array(variantSchema)
    .min(1, "At least one variant is required")
    .refine(
      (variants) => {
        const combos = variants.map((v) => `${v.color}-${v.size}`);
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
