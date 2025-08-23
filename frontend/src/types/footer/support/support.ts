// src/types/support.ts

export type Priority = "low" | "medium" | "high" | "urgent";
export type Status = "open" | "in_progress" | "resolved" | "closed";
export type Category =
  | "product_inquiry"
  | "order_issue"
  | "delivery"
  | "return_refund"
  | "technical"
  | "general";

export interface SupportTicket {
  _id?: string;
  ticketNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  subject: string;
  description: string;
  category: Category;
  priority: Priority;
  status: Status;
  productId?: string;
  orderId?: string;
  assignedTo?: string;
  userId?: string;
  replies?: {
    message: string;
    isAdmin: boolean;
    timestamp: string;
  }[];
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SupportFormData {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  subject: string;
  description: string;
  category: Category;
  orderId?: string;
}
