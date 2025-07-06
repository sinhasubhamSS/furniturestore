import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  gstRate: z.number().min(0),

  basePrice: z.number().min(0),
  stock: z.number().min(0),
  images: z
    .array(z.string().url())
    .min(1, "At least one image URL is required"),
  category: z.string().min(1),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
