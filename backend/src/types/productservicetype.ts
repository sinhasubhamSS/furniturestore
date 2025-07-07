import { Types } from "mongoose";

export interface IProductInput {
  name: string;
  slug: string;
  title: string;
  description: string;
  gstRate: number;
  price: number;
  basePrice: number;
  images: {
    url: string;
    public_id: string;
  }[];
  stock: number;
  category: Types.ObjectId;
  isPublished: boolean;
}
