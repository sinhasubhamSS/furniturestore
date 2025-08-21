import { z } from "zod";

export const supportTicketSchema = z.object({
  customerName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name too long")
    .trim(),

  customerEmail: z.string().email("Invalid email format").toLowerCase().trim(),

  customerPhone: z
    .string()
    .regex(/^[+]?[0-9]{10,15}$/, "Invalid phone number")
    .trim(),

  subject: z
    .string()
    .min(5, "Subject must be at least 5 characters")
    .max(500, "Subject too long")
    .trim(),

  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message too long")
    .trim(),

  category: z.enum([
    "product_inquiry",
    "order_issue",
    "delivery",
    "return_refund",
    "technical",
    "general",
  ]),

  // Optional fields
  orderId: z
    .string()
    .regex(/^[A-Z]{2,4}[0-9]{4,8}$/, "Invalid order ID format")
    .optional(),

  productId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid product ID")
    .optional(),
});

export type SupportTicketInput = z.infer<typeof supportTicketSchema>;

// For API responses
export const supportTicketResponseSchema = z.object({
  success: z.boolean(),
  ticketNumber: z.string().optional(),
  message: z.string(),
  error: z.string().optional(),
});

export type SupportTicketResponse = z.infer<typeof supportTicketResponseSchema>;
