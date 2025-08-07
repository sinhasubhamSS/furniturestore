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
        color: z.string().optional(),
        size: z.string().optional(),
        basePrice: z.number().min(0, "Base price must be 0 or more"),
        gstRate: z.number().min(0, "GST rate must be 0 or more"),
        stock: z.number().min(0, "Stock must be 0 or more"),
        images: z
          .array(
            z.object({
              url: z.string().url("Invalid image URL"),
              public_id: z.string().min(1, "Public ID is required"),
            })
          )
          .min(1, "At least one image is required"),
      })
    )
    .optional(),

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

export type CreateProductInput = z.infer<typeof createProductSchema>;
