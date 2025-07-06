import { z } from "zod";
import { Types } from "mongoose";

// Helper to validate ObjectId
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

export const createProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  gstRate: z.preprocess((val) => Number(val), z.number().min(0)),
  basePrice: z.preprocess((val) => Number(val), z.number().min(0)),
  stock: z.preprocess((val) => Number(val), z.number().min(0)),

  category: objectId,
  slug: z.string().optional(),
  isPublished: z.boolean().optional(),

  // ✅ New: Either measurement or customMeasurement
  // measurement: objectId.optional(),

  // customMeasurement: z
  //   .object({
  //     length: z.preprocess((val) => Number(val), z.number().min(0)),
  //     width: z.preprocess((val) => Number(val), z.number().min(0)),
  //     height: z.preprocess((val) => Number(val), z.number().min(0)),
  //     unit: z.enum(["cm", "in"]),
  //   })
  //   .optional(),
});

export const updateProductSchema = createProductSchema.partial();

// price: z.preprocess((val) => Number(val), z.number().min(0)),
