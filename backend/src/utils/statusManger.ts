import { AppError } from "./AppError";

export class StatusManager {
  /**
   * Validate status transition based on allowed transitions map
   */
  static validateTransition<T extends string>(
    currentStatus: T,
    newStatus: T,
    allowedTransitions: Record<T, T[]>,
    entityType: string = "Entity"
  ): void {
    if (!allowedTransitions[currentStatus]?.includes(newStatus)) {
      throw new AppError(
        `Invalid ${entityType} transition from ${currentStatus} to ${newStatus}`,
        400
      );
    }
  }

  /**
   * Get next allowed statuses for current status - FIXED with generic type
   */
  static getNextAllowedStatuses<T extends string>(
    currentStatus: T,
    allowedTransitions: Record<T, T[]>
  ): T[] {
    return allowedTransitions[currentStatus] || [];
  }
}
