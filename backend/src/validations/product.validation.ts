import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  gstRate: z.preprocess((val) => Number(val), z.number().min(0)),
  // price: z.preprocess((val) => Number(val), z.number().min(0)),
  basePrice: z.preprocess((val) => Number(val), z.number().min(0)),
  stock: z.preprocess((val) => Number(val), z.number().min(0)),
  category: z.string().min(1, "Category is required"),
});

// ✅ updateProductSchema using Partial
export const updateProductSchema = createProductSchema.partial();
