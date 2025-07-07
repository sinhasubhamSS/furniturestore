import { Types } from "mongoose";
import { z } from "zod";

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
  name: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  gstRate: z.preprocess((val) => Number(val), z.number().min(0)),
  basePrice: z.preprocess((val) => Number(val), z.number().min(0)),
  stock: z.preprocess((val) => Number(val), z.number().min(0)),
  category: objectId,
  slug: z.string().optional(),
  isPublished: z.boolean().optional(),
  images: z
    .array(
      z.object({
        url: z.string().url({ message: "Invalid image URL" }),
        public_id: z.string().min(1, "public_id is required"),
      })
    )
    .min(1, "At least one image is required"),
});

export const updateProductSchema = createProductSchema.partial();
