import { Types } from "mongoose";
import { z } from "zod";

// ✅ ObjectId validator
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

// ✅ Image schema (used in variants and main images)
const imageSchema = z.object({
  url: z.string().url({ message: "Invalid image URL" }),
  public_id: z.string().min(1, "public_id is required"),
});

// ✅ Variant schema
const variantSchema = z.object({
  color: z.string().optional(),
  size: z.string().optional(),
  price: z.preprocess((val) => Number(val), z.number().min(0)),
  basePrice: z.preprocess((val) => Number(val), z.number().min(0)),
  gstRate: z.preprocess((val) => Number(val), z.number().min(0)),
  stock: z.preprocess((val) => Number(val), z.number().min(0)),
  images: z.array(imageSchema).min(1),
});

// ✅ Specification schema
const specificationSchema = z.object({
  key: z.string().min(1),
  value: z.string().min(1),
});

// ✅ Measurements schema
const measurementsSchema = z.object({
  width: z.number().optional(),
  height: z.number().optional(),
  depth: z.number().optional(),
  weight: z.number().optional(),
});

// ✅ Create product schema
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

  // ✅ New fields
  variants: z.array(variantSchema).optional(),
  specifications: z.array(specificationSchema).optional(),
  measurements: measurementsSchema.optional(),
  colors: z.array(z.string()).optional(),
  sizes: z.array(z.string()).optional(),
  warranty: z.string().optional(),
  disclaimer: z.string().optional(),

  images: z.array(imageSchema).min(1, "At least one image is required"),
});

// ✅ Update schema — make all fields optional
export const updateProductSchema = createProductSchema.partial();
