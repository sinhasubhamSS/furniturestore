import { Schema, model, models, Document, Types } from "mongoose";
import slugify from "slugify";

// Interface
export interface IProduct extends Document {
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
  createdBy: Types.ObjectId;
  createdAt: Date;
  isPublished: boolean;
}

// Schema
const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
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
      required: [true, "Base price is required"],
    },
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        public_id: {
          type: String,
          required: true,
        },
      },
    ],
    stock: {
      type: Number,
      required: true,
      default: 1,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
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
    isPublished: {
      type: Boolean,
      default: false, // Jab tak admin publish na kare
    },
  },
  { timestamps: true }
);

// ✅ Slugify before saving
productSchema.pre("save", function (next) {
  if (!this.isModified("name")) return next();
  this.slug = slugify(this.name, { lower: true, strict: true });
  if (this.isModified("basePrice") || this.isModified("gstRate")) {
    this.price = this.basePrice + (this.basePrice * this.gstRate) / 100;
  }
  next();
});

// ✅ Text Index
productSchema.index(
  {
    name: "text",
    title: "text",
    description: "text",
  },
  {
    weights: {
      name: 10,
      title: 5,
      description: 3,
    },
    name: "productSearchIndex",
  }
);

// ✅ Category + Price index
productSchema.index({ category: 1, price: -1 });

// ✅ Export model
const Product = models.Product || model<IProduct>("Product", productSchema);
export default Product;
