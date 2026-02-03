// lib/validations/product.schema.ts
import { z } from "zod";

/* ---------------- Variant Schema ---------------- */

export const variantSchema = z.object({
  attributes: z.object({
    finish: z.string().min(1, "Finish is required"), // Walnut / Teak / Natural
    size: z.string().optional(), // King / Queen
    seating: z.string().optional(), // 3 Seater / 5 Seater
    configuration: z.string().optional(), // 3+1+1
  }),

  // SOURCE INPUT (admin enters)
  basePrice: z
    .number({
      required_error: "Base price is required",
      invalid_type_error: "Base price must be a number",
    })
    .min(0.01, "Base price must be greater than 0"),

  gstRate: z
    .number({
      required_error: "GST rate is required",
      invalid_type_error: "GST rate must be a number",
    })
    .min(0, "GST rate must be 0 or more"),

  // marketing MRP (GST already included)
  listingPrice: z.number().min(0).optional(),

  stock: z
    .number({
      required_error: "Stock is required",
      invalid_type_error: "Stock must be a number",
    })
    .int()
    .min(0, "Stock must be 0 or more"),

  reservedStock: z.number().int().min(0).optional(),

  // backend-computed (not trusted from client)
  gstAmount: z.number().optional(),
  sellingPrice: z.number().optional(),

  // discount (computed by backend pricing engine)
  discountPercent: z
    .number()
    .min(0)
    .max(90, "Discount must be between 0–90%")
    .default(0),

  discountValidUntil: z.string().optional(),

  images: z
    .array(
      z.object({
        url: z.string().url("Invalid image URL"),
        public_id: z.string().min(1, "Public ID is required"),
        thumbSafe: z.string().optional(),
        isPrimary: z.boolean().optional(),
      }),
    )
    .min(1, "At least one image is required"),

  measurements: z
    .object({
      length: z.number().optional(),
      width: z.number().optional(),
      height: z.number().optional(),
      depth: z.number().optional(),
      weight: z.number().optional(),
    })
    .optional(),
});

/* ---------------- Product Schema ---------------- */

export const createProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  title: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  isPublished: z.boolean().optional(),

  variants: z
    .array(variantSchema)
    .min(1, "At least one variant is required")
    .refine(
      (variants) => {
        const combos = variants.map(
          (v) =>
            `${v.attributes.finish}-${v.attributes.size ?? ""}-${v.attributes.configuration ?? ""}`,
        );
        return combos.length === new Set(combos).size;
      },
      { message: "Each variant combination must be unique" },
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
            }),
          )
          .min(1),
      }),
    )
    .optional(),

  // ✅ WARRANTY (MONTHS ONLY – BACKEND SYNCED)
  warrantyPeriod: z
    .number({
      invalid_type_error: "Warranty period must be a number",
    })
    .int("Warranty period must be in whole months")
    .positive("Warranty period must be greater than 0")
    .refine(
      (v) => [6, 12, 18, 24, 36].includes(v),
      "Warranty must be 6, 12, 18, 24 or 36 months",
    )
    .optional(),

  disclaimer: z.string().optional(),
});

export const updateProductSchema = createProductSchema.partial();

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type VariantInput = z.infer<typeof variantSchema>;
