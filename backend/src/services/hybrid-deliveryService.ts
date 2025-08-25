import { DeliveryZone } from "../models/deliveryzone.models";


export class HybridDeliveryService {
  static async checkDeliverability(pincode: string) {
    const startTime = Date.now();
    
    // Input validation
    if (!pincode || !/^\d{6}$/.test(pincode.trim())) {
      return {
        isServiceable: false,
        message: "Please enter a valid 6-digit pincode",
        source: 'validation',
        responseTime: `${Date.now() - startTime}ms`
      };
    }
    
    // Database lookup
    const dbResult = await DeliveryZone.findOne({ 
      pincode: pincode.trim(), 
      isServiceable: true 
    });
    
    if (dbResult) {
      return {
        isServiceable: true,
        pincode: dbResult.pincode,
        city: dbResult.city,
        district: dbResult.district,
        zone: dbResult.zone,
        deliveryCharge: dbResult.deliveryCharge,
        deliveryDays: dbResult.deliveryDays,
        codAvailable: dbResult.codAvailable,
        maxWeight: dbResult.maxWeight,
        courierPartner: dbResult.courierPartner,
        source: 'database',
        responseTime: `${Date.now() - startTime}ms`
      };
    }
    
    // Not serviceable
    return {
      isServiceable: false,
      message: "Currently not serviceable in this area. Contact WhatsApp for special delivery.",
      source: 'database',
      responseTime: `${Date.now() - startTime}ms`
    };
  }

  static async getBulkDeliverability(pincodes: string[]) {
    const results = await Promise.allSettled(
      pincodes.map(pincode => this.checkDeliverability(pincode))
    );
    
    return results.map((result, index) => ({
      pincode: pincodes[index],
      ...((result.status === 'fulfilled') ? result.value : {
        isServiceable: false,
        message: "Error checking this pincode",
        source: 'error'
      })
    }));
  }

  static async getServiceableZones() {
    const zones = await DeliveryZone.aggregate([
      { $match: { isServiceable: true } },
      { 
        $group: { 
          _id: '$zone', 
          count: { $sum: 1 },
          minCharge: { $min: '$deliveryCharge' },
          maxCharge: { $max: '$deliveryCharge' },
          avgDays: { $avg: '$deliveryDays' }
        } 
      },
      { $sort: { _id: 1 } }
    ]);
    
    return zones;
  }
}
