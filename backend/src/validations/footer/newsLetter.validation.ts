import { z } from "zod";

export const newsletterSubscribeSchema = z.object({
  email: z.string().email("Invalid email format").toLowerCase().trim(),

  preferences: z
    .array(
      z.enum([
        "offers",
        "new_products",
        "home_decor_tips",
        "furniture_care",
        "seasonal_collections",
      ])
    )
    .optional()
    .default(["offers", "new_products"]),

  source: z
    .enum(["website_footer", "checkout", "popup", "manual", "import"])
    .optional()
    .default("website_footer"),
});

export const newsletterUnsubscribeSchema = z.object({
  email: z.string().email("Invalid email format").toLowerCase().trim(),

  token: z.string().min(10, "Invalid unsubscribe token").optional(),
});

export const newsletterPreferencesSchema = z.object({
  email: z.string().email("Invalid email format").toLowerCase().trim(),

  preferences: z
    .array(
      z.enum([
        "offers",
        "new_products",
        "home_decor_tips",
        "furniture_care",
        "seasonal_collections",
      ])
    )
    .min(1, "At least one preference must be selected"),
});

export type NewsletterSubscribeInput = z.infer<
  typeof newsletterSubscribeSchema
>;
export type NewsletterUnsubscribeInput = z.infer<
  typeof newsletterUnsubscribeSchema
>;
export type NewsletterPreferencesInput = z.infer<
  typeof newsletterPreferencesSchema
>;
