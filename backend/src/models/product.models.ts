import { Schema, model, models, Document, Types } from "mongoose";
import slugify from "slugify";

// Variant Schema & Interface
export interface IVariant extends Document {
  sku: string;
  color: string;
  size: string;
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
  sku: { type: String, required: true,  },
  color: { type: String, required: true },
  size: { type: String, required: true },
  basePrice: { type: Number, required: true },
  gstRate: { type: Number, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true, default: 0 },
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
  specifications?: {
    section: string;
    specs: { key: string; value: string }[];
  }[];
  measurements?: {
    width?: number;
    height?: number;
    depth?: number;
    weight?: number;
  };
  variants: Types.DocumentArray<IVariant>; // Required array
  colors: string[]; // Computed from variants
  sizes: string[]; // Computed from variants
  warranty?: string;
  disclaimer?: string;
  category: Types.ObjectId;
  stock: number; // Computed total stock
  price: number; // Computed min price
  createdBy: Types.ObjectId;
  createdAt: Date;
  isPublished: boolean;
}

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },

    // Variants are required and must have at least one
    variants: {
      type: [variantSchema],
      required: true,
      validate: {
        validator: (v: IVariant[]) => v.length > 0,
        message: "At least one variant is required",
      },
    },

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

    // Computed from variants
    colors: { type: [String], default: [] },
    sizes: { type: [String], default: [] },

    warranty: { type: String, default: "" },
    disclaimer: { type: String, default: "" },

    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },

    // Computed from variants
    stock: { type: Number, required: true, default: 0 },
    price: { type: Number, required: true }, // Min variant price

    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isPublished: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Pre-save middleware for slug generation
productSchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g,
    });
  }
  next();
});


// Indexes for optimization
productSchema.index({ slug: 1 }, { unique: true });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ stock: 1 });
productSchema.index({ "variants.sku": 1 }, { unique: true });

// Text search index
productSchema.index(
  { name: "text", title: "text", description: "text" },
  {
    weights: { name: 10, title: 5, description: 3 },
    name: "productSearchIndex",
  }
);

const Product = models.Product || model<IProduct>("Product", productSchema);
export default Product;
