// src/services/hybrid-delivery.service.ts
import { DeliveryZone } from "../models/deliveryzone.models";
import {
  ServiceableResult,
  NotServiceableResult,
  DeliveryResult,
} from "../types/deliverytypes";

export class HybridDeliveryService {
  // ========================================
  // 👤 CORE USER FEATURES - Customer focused
  // ========================================

  /**
   * ✅ CORE: Check if delivery is available for pincode
   * Used: Product page, Cart, Checkout
   */
  static async checkDeliverability(pincode: string): Promise<DeliveryResult> {
    const startTime = Date.now();

    // Input validation
    if (!pincode || !/^\d{6}$/.test(pincode.trim())) {
      return {
        isServiceable: false,
        message: "Please enter a valid 6-digit pincode",
        source: "validation",
        responseTime: `${Date.now() - startTime}ms`,
      } as NotServiceableResult;
    }

    // Database lookup
    const dbResult = await DeliveryZone.findOne({
      pincode: pincode.trim(),
      isServiceable: true,
    });

    if (dbResult) {
      return {
        isServiceable: true,
        pincode: dbResult.pincode,
        city: dbResult.city,
        state: dbResult.state,
        district: dbResult.district,
        zone: dbResult.zone,
        deliveryCharge: dbResult.deliveryCharge,
        deliveryDays: dbResult.deliveryDays,
        codAvailable: dbResult.codAvailable,
        maxWeight: dbResult.maxWeight,
        courierPartner: dbResult.courierPartner,
        source: "database",
        responseTime: `${Date.now() - startTime}ms`,
      } as ServiceableResult;
    }

    return {
      isServiceable: false,
      message:
        "Currently not serviceable in this area. Contact support for assistance.",
      source: "database",
      responseTime: `${Date.now() - startTime}ms`,
    } as NotServiceableResult;
  }

  /**
   * ✅ USEFUL: Show service areas to customers
   * Used: Website info page, delivery information
   */
  static async getServiceableZones() {
    const zones = await DeliveryZone.aggregate([
      { $match: { isServiceable: true } },
      {
        $group: {
          _id: "$zone",
          count: { $sum: 1 },
          minCharge: { $min: "$deliveryCharge" },
          maxCharge: { $max: "$deliveryCharge" },
          avgDays: { $avg: "$deliveryDays" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return zones;
  }

  // ========================================
  // 🔐 BASIC ADMIN FEATURES - Simple management
  // ========================================

  /**
   * ✅ ADMIN: Get all zones for management
   * Used: Admin view all areas
   */
  static async getAllZones() {
    return await DeliveryZone.find().sort({ zone: 1, city: 1 }).limit(100); // Limit for performance
  }

  /**
   * ✅ ADMIN: Toggle zone on/off
   * Used: Admin enable/disable areas
   */
  static async toggleZone(pincode: string) {
    const zone = await DeliveryZone.findOne({ pincode });
    if (!zone) {
      throw new Error("Zone not found");
    }

    zone.isServiceable = !zone.isServiceable;
    return await zone.save();
  }
}
