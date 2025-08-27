// src/shared/types/delivery.ts
export interface DeliveryInfo {
  pincode: string;
  zone: string;
  estimatedDays: number;
  deliveryCharge: number;
  originalCharge: number;
  discount: number;
  courierPartner: string;
  codAvailable: boolean;
  isServiceable: boolean;
}

export interface DeliveryCheckRequest {
  pincode: string;
}

export interface DeliveryCalculateRequest {
  pincode: string;
  weight: number;
  orderValue?: number;
}

export interface DeliveryResult {
  isServiceable: boolean;
  zone: string;
  city: string;
  district: string;
  deliveryDays: number;
  deliveryCharge: number;
  maxWeight: number;
  courierPartner: string;
  codAvailable: boolean;
  message?: string;
}

export interface DeliveryCharges {
  zone: string;
  originalCharge: number;
  finalCharge: number;
  discount: number;
  freeDeliveryEligible: boolean;
  weightSurcharge: number;
  estimatedDays: number;
  courierPartner: string;
  codAvailable: boolean;
}
