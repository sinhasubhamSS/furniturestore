// ✅ Return Status Enum - Backend ke exact match
export enum ReturnStatus {
  Requested = "requested",
  Approved = "approved", 
  Rejected = "rejected",
  PickedUp = "picked_up",
  Received = "received",
  Processed = "processed",
}

// ✅ Return Item Interface - Individual item being returned
export interface ReturnItem {
  orderItemIndex: number;           // Index from order.orderItemsSnapshot
  quantity: number;                 // Quantity to return
  reason: string;                   // Item-specific return reason  
  condition: "unopened" | "used" | "damaged";  // Product condition
}

// ✅ Main Return Interface - Complete return request
export interface Return {
  _id?: string;                     // MongoDB ObjectId (optional for new returns)
  returnId: string;                 // RET-20250823-00001
  orderId: string;                  // Original order reference
  user: string;                     // User ObjectId as string
  returnItems: ReturnItem[];        // Items being returned
  returnReason: string;             // Overall return reason
  refundAmount: number;             // Calculated refund amount
  status: ReturnStatus;             // Current status
  requestedAt: string;              // ISO date string
  processedAt?: string;             // Optional - when processed
  refundProcessedAt?: string;       // Optional - when refund completed
  createdAt?: string;               // MongoDB timestamps
  updatedAt?: string;               // MongoDB timestamps
}

// ✅ Return Reasons Constants - For dropdown/form options
export const RETURN_REASONS = {
  DEFECTIVE: "Product is defective or damaged",
  WRONG_ITEM: "Received wrong item", 
  SIZE_ISSUE: "Size doesn't fit",
  NOT_AS_DESCRIBED: "Product not as described",
  CHANGED_MIND: "Changed my mind",
  LATE_DELIVERY: "Delivered too late",
  DUPLICATE_ORDER: "Ordered by mistake",
  BETTER_PRICE: "Found better price elsewhere",
} as const;

// ✅ Form Data Interfaces - For UI forms
export interface CreateReturnRequest {
  orderId: string;
  returnReason: string;
  returnItems: ReturnItem[];
}

export interface ReturnEligibilityResponse {
  isEligible: boolean;
  order: any; // Order details
  timeRemaining: number;
  reason: string;
}

export interface ReturnListResponse {
  returns: Return[];
  pagination: {
    page: number;
    limit: number; 
    total: number;
    pages: number;
  };
}

// ✅ API Response Wrappers
export interface ApiResponse<T = any> {
  status: number;
  data: T;
  message: string;
}

// ✅ RTK Query Response Types
export interface CreateReturnResponse {
  return: Return;
  refundAmount: number;
}

// ✅ Form State Interface
export interface ReturnFormData {
  returnReason: string;
  returnItems: {
    [key: number]: {  // orderItemIndex as key
      quantity: number;
      reason: string;
      condition: "unopened" | "used" | "damaged";
    };
  };
}

// ✅ Export return reason values for dropdowns
export const RETURN_REASON_OPTIONS = Object.values(RETURN_REASONS);

// ✅ Type guards for better type safety
export const isReturnStatus = (status: string): status is ReturnStatus => {
  return Object.values(ReturnStatus).includes(status as ReturnStatus);
};

export const isReturnCondition = (condition: string): condition is "unopened" | "used" | "damaged" => {
  return ["unopened", "used", "damaged"].includes(condition);
};
