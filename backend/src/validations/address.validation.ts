import { z } from "zod";

export const createAddressSchema = z.object({
  fullName: z.string().min(3),
  mobile: z.string().regex(/^[6-9]\d{9}$/, "Invalid Indian mobile number"),
  addressLine1: z.string().min(5),
  addressLine2: z.string().optional(),
  city: z.string().min(2),
  landmark: z.string().min(2),
  state: z.string().min(2),
  pincode: z.string().regex(/^[1-9][0-9]{5}$/, "Invalid pincode"),
  country: z.string().min(2),
  isDefault: z.boolean().optional(),
});

export type CreateAddressInput = z.infer<typeof createAddressSchema>;
