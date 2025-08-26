// src/utils/DeliveryCalculator.ts - ✅ CORRECT
export class DeliveryCalculator {
  static readonly EXTRA_WEIGHT_CHARGE = 20;
  static readonly FREE_DELIVERY_THRESHOLD = 100000;
  static readonly FREE_DELIVERY_DISCOUNT = 50;

  static calculateCharges(
    deliveryInfo: { deliveryCharge: number; maxWeight: number },
    weight: number,
    orderValue: number
  ) {
    let totalCharge = deliveryInfo.deliveryCharge;

    // Extra weight charges
    if (weight > deliveryInfo.maxWeight) {
      const extraWeight = weight - deliveryInfo.maxWeight;
      totalCharge += Math.ceil(extraWeight) * this.EXTRA_WEIGHT_CHARGE;
    }

    // Free delivery discount
    const freeDeliveryEligible = orderValue >= this.FREE_DELIVERY_THRESHOLD;
    const discount = freeDeliveryEligible ? Math.min(this.FREE_DELIVERY_DISCOUNT, totalCharge) : 0;
    const finalCharge = Math.max(0, totalCharge - discount);

    return {
      originalCharge: deliveryInfo.deliveryCharge,
      totalCharge,
      weightSurcharge: totalCharge - deliveryInfo.deliveryCharge,
      discount,
      finalCharge,
      freeDeliveryEligible,
    };
  }
}
