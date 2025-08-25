// models/delivery-zone.model.ts
import { Schema, model, Document } from "mongoose";

// Delivery Zone interface
export interface DeliveryZoneDocument extends Document {
  pincode: string;
  city: string;
  state: string;
  district: string;
  zone: 'Zone1' | 'Zone2' | 'Zone3';
  deliveryCharge: number;
  deliveryDays: number;
  codAvailable: boolean;
  isServiceable: boolean;
  maxWeight: number; // kg mein
  courierPartner?: string; // "self" ya "dtdc" ya "delhivery"
  createdAt?: Date;
  updatedAt?: Date;
}

const deliveryZoneSchema = new Schema<DeliveryZoneDocument>(
  {
    pincode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 6,
      maxlength: 6,
      index: true // ✅ Fast search ke liye
    },
    
    city: {
      type: String,
      required: true,
      trim: true
    },
    
    state: {
      type: String,
      required: true,
      default: 'Jharkhand'
    },
    
    district: {
      type: String,
      required: true,
      trim: true
    },
    
    zone: {
      type: String,
      enum: ['Zone1', 'Zone2', 'Zone3'],
      required: true
    },
    
    deliveryCharge: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    
    deliveryDays: {
      type: Number,
      required: true,
      min: 1,
      max: 7,
      default: 2
    },
    
    codAvailable: {
      type: Boolean,
      default: true
    },
    
    isServiceable: {
      type: Boolean,
      default: true,
      index: true // ✅ Active pincodes filter ke liye
    },
    
    maxWeight: {
      type: Number,
      default: 10, // 10kg max
      min: 1
    },
    
    courierPartner: {
      type: String,
      enum: ['self', 'dtdc', 'delhivery', 'india_post'],
      default: 'self'
    }
  },
  { 
    timestamps: true,
    collection: 'delivery_zones'
  }
);

// ✅ Compound index for faster queries
deliveryZoneSchema.index({ pincode: 1, isServiceable: 1 });
deliveryZoneSchema.index({ zone: 1, isServiceable: 1 });

export const DeliveryZone = model<DeliveryZoneDocument>('DeliveryZone', deliveryZoneSchema);
