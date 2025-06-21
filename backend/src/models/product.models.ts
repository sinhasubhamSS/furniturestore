import { Schema, model, models, Document, Types } from "mongoose";

// Interface
export interface IProduct extends Document {
  name: string;
  title: string;
  description: string;
  price: number;
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
    price: {
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

// Model
const Product = models.Product || model<IProduct>("Product", productSchema);
export default Product;
