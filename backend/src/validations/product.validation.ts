import { z } from "zod";
import { Types } from "mongoose";

export const createProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  gstRate: z.preprocess((val) => Number(val), z.number().min(0)),
  basePrice: z.preprocess((val) => Number(val), z.number().min(0)),
  stock: z.preprocess((val) => Number(val), z.number().min(0)),

  // ✅ convert + validate
  category: z.preprocess(
    (val) => {
      if (typeof val === "string" && Types.ObjectId.isValid(val)) {
        return new Types.ObjectId(val);
      }
      return val;
    },
    z.custom<Types.ObjectId>((val) => val instanceof Types.ObjectId, {
      message: "Invalid category ID",
    })
  ),
  slug: z.string().optional(),
});

export const updateProductSchema = createProductSchema.partial();

// price: z.preprocess((val) => Number(val), z.number().min(0)),
