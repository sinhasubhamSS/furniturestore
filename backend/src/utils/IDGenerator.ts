import mongoose from "mongoose";

export class IDGenerator {
  /**
   * Generate daily sequence-based ID with prefix
   * Format: PREFIX-YYYYMMDD-00001
   */
  static async generateDailySequenceId(
    prefix: string,
    model: mongoose.Model<any>,
    dateField: string = 'createdAt'
  ): Promise<string> {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    
    // Get start and end of today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    
    // Count today's documents
    const todayCount = await model.countDocuments({
      [dateField]: { $gte: startOfDay, $lt: endOfDay }
    });
    
    const sequence = (todayCount + 1).toString().padStart(5, "0");
    return `${prefix}-${dateStr}-${sequence}`;
  }

  /**
   * Generate order ID - SUVI-YYYYMMDD-00001
   */
  static async generateOrderId(orderModel: mongoose.Model<any>): Promise<string> {
    return await this.generateDailySequenceId('SUVI', orderModel, 'placedAt');
  }

  /**
   * Generate return ID - RET-YYYYMMDD-00001
   */
  static async generateReturnId(returnModel: mongoose.Model<any>): Promise<string> {
    return await this.generateDailySequenceId('RET', returnModel, 'requestedAt');
  }
}
