import { DeliveryZone } from "../../models/deliveryzone.models";
import { DataLoader } from "./data-loader";

export async function seedJharkhandPincodes(environment: string = 'development') {
  try {
   
    
    // Clear existing data (optional)
    const clearData = process.env.CLEAR_SEED_DATA === 'true';
    if (clearData) {
      await DeliveryZone.deleteMany({});
   
    }
    
    // Load data from files
    const pincodeData = DataLoader.loadEnvironmentData(environment);
    
    if (!pincodeData || !Array.isArray(pincodeData) || pincodeData.length === 0) {
      throw new Error('No pincode data found to seed');
    }
    
   
    
    // Insert data with error handling
    const inserted = await DeliveryZone.insertMany(pincodeData, { 
      ordered: false  // Continue inserting even if some fail (duplicates)
    });
    
   
    // Summary by zone
    const summary = await DeliveryZone.aggregate([
      { $group: { _id: '$zone', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

// ✅ Export individual functions for flexibility
export async function seedPopularPincodes() {
  return seedJharkhandPincodes('development');
}

export async function seedAllPincodes() {
  return seedJharkhandPincodes('production');
}
