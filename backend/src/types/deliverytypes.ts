// src/types/delivery.types.ts
export interface ServiceableResult {
  isServiceable: true;
  pincode: string;
  city: string;
  state: string;
  district: string;
  zone: "Zone1" | "Zone2" | "Zone3";
  deliveryCharge: number;
  deliveryDays: number;
  codAvailable: boolean;
  maxWeight: number;
  courierPartner?: string;
  source: string;
  responseTime: string;
}

export interface NotServiceableResult {
  isServiceable: false;
  message: string;
  source: string;
  responseTime: string;
}

// Union type for service responses
export type DeliveryResult = ServiceableResult | NotServiceableResult;
