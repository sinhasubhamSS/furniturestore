import { DeliveryZone } from "../../models/deliveryzone.models";
import { DataLoader } from "./data-loader";

export async function seedJharkhandPincodes(environment: string = 'development') {
  try {
    console.log(`🌱 Seeding ${environment} pincode data...`);
    
    // Clear existing data (optional)
    const clearData = process.env.CLEAR_SEED_DATA === 'true';
    if (clearData) {
      await DeliveryZone.deleteMany({});
      console.log('🗑️ Cleared existing pincode data');
    }
    
    // Load data from files
    const pincodeData = DataLoader.loadEnvironmentData(environment);
    
    if (!pincodeData || !Array.isArray(pincodeData) || pincodeData.length === 0) {
      throw new Error('No pincode data found to seed');
    }
    
    console.log(`📝 Attempting to seed ${pincodeData.length} pincodes...`);
    
    // Insert data with error handling
    const inserted = await DeliveryZone.insertMany(pincodeData, { 
      ordered: false  // Continue inserting even if some fail (duplicates)
    });
    
    console.log(`✅ Successfully seeded ${inserted.length}/${pincodeData.length} pincodes`);
    
    // Summary by zone
    const summary = await DeliveryZone.aggregate([
      { $group: { _id: '$zone', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    console.log('📊 Zone-wise summary:', summary);
    
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
