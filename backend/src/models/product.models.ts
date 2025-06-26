import { Schema, model, models, Document, Types } from "mongoose";
import { title } from "process";

// Interface
export interface IProduct extends Document {
  name: string;
  title: string;
  description: string;
  gstRate: number;
  price: number;
  basePrice: number;
  images: string[]; // Cloudinary URLs
  stock: number;
  category: string;
  createdBy: Types.ObjectId; // userId of admin (ref to User model)
  createdAt: Date;
}

// Schema
const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    title: {
      type: String,
      required: [true, "Product title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
    },
    gstRate: {
      type: Number,
      required: [true, "gst rate is required"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
    },
    basePrice: {
      type: Number,
      required: [true, "Price is required"],
    },
    images: [
      {
        type: String,
        required: true,
      },
    ],
    stock: {
      type: Number,
      required: true,
      default: 1,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

productSchema.index(
  {
    name: "text",
    title: "text",
    description: "text",
    category: "text",
  },
  {
    weights: {
      name: 10,
      title: 5,
      description: 3,
      category: 2,
    },
    name: "productSearchIndex",
  }
);
productSchema.index({ category: 1, price: -1 });
const Product = models.Product || model<IProduct>("Product", productSchema);
export default Product;
