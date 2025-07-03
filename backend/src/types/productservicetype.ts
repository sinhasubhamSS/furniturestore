// export interface IProductInput {
//   name: string;
//   title: string;
//   description: string;
//   gstRate: number;
//   price: number;
//   stock: number;
//   category: string;
// }


import { Types } from "mongoose";

export interface IProductInput {
  name: string;
  title: string;
  description: string;
  gstRate: number;
  price: number;
  stock: number;

  // ✅ category should be a MongoDB ObjectId type
  category: Types.ObjectId;
}
