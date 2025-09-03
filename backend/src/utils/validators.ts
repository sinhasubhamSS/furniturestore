import { AppError } from "./AppError";

export class ValidationUtils {
  /**
   * Validate Indian pincode format
   */
  static validatePincode(pincode: string): void {
    if (!pincode || !/^\d{6}$/.test(pincode)) {
      throw new AppError("Valid 6-digit pincode is required", 400);
    }
  }

  /**
   * Validate order items array
   */
  static validateOrderItems(items: any[]): void {
    if (!items || items.length === 0) {
      throw new AppError("No items provided", 400);
    }
  }

  /**
   * Validate MongoDB ObjectId format
   */
  static validateObjectId(id: string, fieldName: string = "ID"): void {
    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      throw new AppError(`Invalid ${fieldName} format`, 400);
    }
  }

  /**
   * Validate pagination parameters
   */
  static validatePagination(page: number, limit: number): { page: number; limit: number } {
    const validPage = Math.max(1, Math.floor(page) || 1);
    const validLimit = Math.min(100, Math.max(1, Math.floor(limit) || 10));
    
    return { page: validPage, limit: validLimit };
  }

  /**
   * Validate return window (7 days from delivery)
   */
  static validateReturnWindow(deliveryDate: Date, windowDays: number = 7): boolean {
    const returnWindowMs = windowDays * 24 * 60 * 60 * 1000;
    const currentDate = new Date();
    return (currentDate.getTime() - deliveryDate.getTime()) <= returnWindowMs;
  }
}
