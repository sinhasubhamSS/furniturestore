import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  gstRate: z.number().min(0),

  basePrice: z.number().min(0),
  stock: z.number().min(0),
  images: z.array(
    z.object({
      url: z.string().url(),
      public_id: z.string(),
    })
  ),

  category: z.string().min(1),
  isPublished: z.boolean().optional(),

});

export type CreateProductInput = z.infer<typeof createProductSchema>;
