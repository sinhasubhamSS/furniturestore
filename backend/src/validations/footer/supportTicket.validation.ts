import { z } from "zod";

export const supportTicketSchema = z.object({
  customerName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name too long")
    .trim(),

  customerEmail: z.string().email("Invalid email format").toLowerCase().trim(),

  customerPhone: z // Made optional
    .string()
    .regex(/^[+]?[0-9]{10,15}$/, "Invalid phone number")
    .trim()
    .optional(),

  subject: z
    .string()
    .min(5, "Subject must be at least 5 characters")
    .max(500, "Subject too long")
    .trim(),

  description: z // Changed from message
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description too long")
    .trim(),

  category: z.enum([
    "product_inquiry",
    "order_issue",
    "delivery",
    "return_refund",
    "technical",
    "general",
  ]),

  // Make all optional and more flexible
  orderId: z
    .string()
    .regex(/^[A-Za-z0-9-_]{4,20}$/, "Invalid order ID format")
    .optional(),

  productId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid product ID")
    .optional(),
});

export type SupportTicketInput = z.infer<typeof supportTicketSchema>;
