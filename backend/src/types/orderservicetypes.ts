export interface ProductSnapshot {
  productId: string;
  name: string;
  image?: string;
  quantity: number;
  price: number;
}

export interface AddressSnapshot {
  fullName: string;
  mobile: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  landmark?: string;
  state: string;
  pincode: string;
  country: string;
}

export interface PaymentInfo {
  method: string;
  status?: string;
  transactionId?: string;
  provider?: string;
  paidAt?: Date;
}
// types/order.types.ts
// import { Types } from "mongoose";
// import { PaymentMethod } from "../models/order.models";

// export interface PlaceOrderRequest {
//   items: {
//     productId: string;
//     quantity: number;
//   }[];
//   shippingAddress: {
//     fullName: string;
//     mobile: string;
//     addressLine1: string;
//     addressLine2?: string;
//     city: string;
//     landmark?: string;
//     state: string;
//     pincode: string;
//     country: string;
//   };
//   payment: {
//     method: PaymentMethod;
//     provider?: string;
//     transactionId?: string;
//   };
// }
