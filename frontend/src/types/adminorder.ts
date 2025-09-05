import { Order, OrderListResponse, OrderStatus } from "./order";

// ✅ Admin-enhanced Order type
export interface AdminOrder extends Order {
  user: {
    _id: string;
    name: string;
    email: string;
    mobile: string;
  };
  internalNotes?: string;
  adminUpdatedBy?: string;
  adminUpdatedAt?: string;
}

// ✅ Admin Order List Response
export interface AdminOrderListResponse extends OrderListResponse {
  orders: AdminOrder[];
}

// ✅ Admin Return Type
export interface AdminReturn {
  _id: string;
  returnId: string;
  orderId: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  order: {
    orderId: string;
    totalAmount: number;
  };
  returnReason: string;
  refundAmount: number;
  status: OrderStatus;
  requestedAt: string;
  processedAt?: string;
  adminNotes?: string;
}

// ✅ Admin Analytics Types
export interface AdminAnalytics {
  totalOrders: number;
  totalRevenue: number;
  totalReturns: number;
  returnRate: number;
  statusBreakdown: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
}
