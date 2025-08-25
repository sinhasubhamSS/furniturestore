import { DeliveryZone } from "../models/deliveryzone.models";

// services/delivery.service.ts
export class DeliveryService {
  // ✅ Main function - Pincode check karna
  static async checkPincodeServiceability(pincode: string) {
    const zone = await DeliveryZone.findOne({
      pincode: pincode.trim(),
      isServiceable: true,
    });

    if (!zone) {
      return {
        isServiceable: false,
        message:
          "Service not available in your area. Contact us on WhatsApp for special arrangements.",
      };
    }

    return {
      isServiceable: true,
      zone: zone.zone,
      deliveryCharge: zone.deliveryCharge,
      deliveryDays: zone.deliveryDays,
      codAvailable: zone.codAvailable,
      courierPartner: zone.courierPartner,
      estimatedDelivery: this.calculateDeliveryDate(zone.deliveryDays),
    };
  }

  // ✅ Delivery date calculate karna
  private static calculateDeliveryDate(days: number): Date {
    const today = new Date();
    const deliveryDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);
    return deliveryDate;
  }

  // ✅ Weight-based charges (future ke liye)
  static calculateWeightCharges(weight: number, baseCharge: number): number {
    if (weight <= 2) return baseCharge;
    if (weight <= 5) return baseCharge + 20;
    if (weight <= 10) return baseCharge + 50;
    return baseCharge + 100; // Heavy items
  }
}
