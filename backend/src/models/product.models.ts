import { Schema, model, models, Document, Types } from "mongoose";
import slugify from "slugify";

// Variant Schema & Interface
export interface IVariant {
  sku: string;
  color?: string;
  size?: string;
  basePrice: number;
  gstRate: number;
  price: number;
  stock: number;
  images: {
    url: string;
    public_id: string;
  }[];
}

const variantSchema = new Schema<IVariant>({
  sku: { type: String, required: true, unique: true },
  color: { type: String },
  size: { type: String },
  basePrice: { type: Number, required: true },
  gstRate: { type: Number, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  images: [
    {
      url: { type: String, required: true },
      public_id: { type: String, required: true },
    },
  ],
});

// Product Schema & Interface
export interface IProduct extends Document {
  name: string;
  slug: string;
  title: string;
  description: string;
  specifications: { key: string; value: string }[];
  measurements?: {
    width?: number;
    height?: number;
    depth?: number;
    weight?: number;
  };
  variants?: IVariant[];
  colors?: string[];
  sizes?: string[];
  warranty?: string;
  disclaimer?: string;
  category: Types.ObjectId;
  stock: number;
  basePrice?: number; // optional when variants exist
  gstRate?: number; // optional when variants exist
  price?: number; // optional when variants exist
  createdBy: Types.ObjectId;
  createdAt: Date;
  isPublished: boolean;
}

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },

    variants: { type: [variantSchema], required: true, default: undefined },

    specifications: [
      {
        section: { type: String, required: true },
        specs: [
          {
            key: { type: String, required: true },
            value: { type: String, required: true },
          },
        ],
      },
    ],

    measurements: {
      width: { type: Number },
      height: { type: Number },
      depth: { type: Number },
      weight: { type: Number },
    },

    colors: { type: [String], default: [] },
    sizes: { type: [String], default: [] },

    warranty: { type: String, default: "" },
    disclaimer: { type: String, default: "" },

    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },

    stock: { type: Number, required: true, default: 0 },

    // Pricing at product root level - optional if variants exist
 
    price: { type: Number, default: undefined },

    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: Date.now },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Pre-save middleware to generate slug and sync price and stock from variants if present
productSchema.pre("save", function (this: IProduct, next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }

  if (this.variants && this.variants.length > 0) {
    // Sync representative pricing & total stock from variants
    this.basePrice = this.variants[0].basePrice;
    this.gstRate = this.variants[0].gstRate;
    this.price = this.variants[0].price;

    this.stock = this.variants.reduce(
      (total, variant) => total + variant.stock,
      0
    );
  } else {
    // If no variants and basePrice/gstRate changed, recalc price
    if (this.isModified("basePrice") || this.isModified("gstRate")) {
      if (
        typeof this.basePrice === "number" &&
        typeof this.gstRate === "number"
      ) {
        this.price = this.basePrice + (this.basePrice * this.gstRate) / 100;
      }
    }
  }

  next();
});

// Indexes for search optimization
productSchema.index(
  {
    name: "text",
    title: "text",
    description: "text",
    "specifications.value": "text",
  },
  {
    weights: { name: 10, title: 5, description: 3, "specifications.value": 2 },
    name: "productSearchIndex",
  }
);

productSchema.index({ category: 1, price: -1 });

const Product = models.Product || model<IProduct>("Product", productSchema);
export default Product;
