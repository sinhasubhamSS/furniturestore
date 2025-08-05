// import { Schema, model, models, Document, Types } from "mongoose";
// import slugify from "slugify";

// // Interface
// export interface IProduct extends Document {
//   name: string;
//   slug: string;
//   title: string;
//   description: string;
//   gstRate: number;
//   price: number;
//   basePrice: number;
//   images: {
//     url: string;
//     public_id: string;
//   }[];
//   stock: number;
//   category: Types.ObjectId;
//   createdBy: Types.ObjectId;
//   createdAt: Date;
//   isPublished: boolean;
// }

// // Schema
// const productSchema = new Schema<IProduct>(
//   {
//     name: {
//       type: String,
//       required: [true, "Product name is required"],
//       trim: true,
//     },
//     slug: {
//       type: String,
//       required: true,
//       unique: true,
//     },
//     title: {
//       type: String,
//       required: [true, "Product title is required"],
//       trim: true,
//     },
//     description: {
//       type: String,
//       required: [true, "Product description is required"],
//     },
//     gstRate: {
//       type: Number,
//       required: [true, "gst rate is required"],
//     },
//     price: {
//       type: Number,
//       required: [true, "Price is required"],
//     },
//     basePrice: {
//       type: Number,
//       required: [true, "Base price is required"],
//     },
//     images: [
//       {
//         url: {
//           type: String,
//           required: true,
//         },
//         public_id: {
//           type: String,
//           required: true,
//         },
//       },
//     ],
//     stock: {
//       type: Number,
//       required: true,
//       default: 1,
//     },
//     category: {
//       type: Schema.Types.ObjectId,
//       ref: "Category",
//       required: true,
//     },
//     createdBy: {
//       type: Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     createdAt: {
//       type: Date,
//       default: Date.now,
//     },
//     isPublished: {
//       type: Boolean,
//       default: false, // Jab tak admin publish na kare
//     },
//   },
//   { timestamps: true }
// );

// // ✅ Slugify before saving
// productSchema.pre("save", function (next) {
//   if (!this.isModified("name")) return next();
//   this.slug = slugify(this.name, { lower: true, strict: true });
//   if (this.isModified("basePrice") || this.isModified("gstRate")) {
//     this.price = this.basePrice + (this.basePrice * this.gstRate) / 100;
//   }
//   next();
// });

// // ✅ Text Index
// productSchema.index(
//   {
//     name: "text",
//     title: "text",
//     description: "text",
//   },
//   {
//     weights: {
//       name: 10,
//       title: 5,
//       description: 3,
//     },
//     name: "productSearchIndex",
//   }
// );

// // ✅ Category + Price index
// productSchema.index({ category: 1, price: -1 });

// // ✅ Export model
// const Product = models.Product || model<IProduct>("Product", productSchema);
// export default Product;
import { Schema, model, models, Document, Types } from "mongoose";
import slugify from "slugify";

export interface IVariant {
  color?: string;
  size?: string;
  price: number;
  basePrice: number;
  gstRate: number;
  stock: number;
  images: {
    url: string;
    public_id: string;
  }[];
}

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
  // for filtering and searching below two
  colors?: string[];
  sizes?: string[];
  warranty?: string;
  disclaimer?: string;
  // ratings: { average: number; totalReviews: number };
  category: Types.ObjectId;
  stock: number; // Sum of variant stocks
  basePrice: number;
  gstRate: number;
  price: number; // Representative price based on first variant or default
  createdBy: Types.ObjectId;
  createdAt: Date;
  isPublished: boolean;
}

const variantSchema = new Schema<IVariant>({
  color: { type: String },
  size: { type: String },
  price: { type: Number, required: true },
  basePrice: { type: Number, required: true },
  gstRate: { type: Number, required: true },
  stock: { type: Number, required: true, default: 0 },
  images: [
    {
      url: { type: String, required: true },
      public_id: { type: String, required: true },
    },
  ],
});

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    specifications: [
      {
        key: { type: String, required: true },
        value: { type: String, required: true },
      },
    ],
    measurements: {
      width: { type: Number },
      height: { type: Number },
      depth: { type: Number },
      weight: { type: Number },
    },
    variants: [variantSchema],
    colors: { type: [String], default: [] },
    sizes: { type: [String], default: [] },
    warranty: { type: String, default: "" },
    disclaimer: { type: String, default: "" },
    // ratings: {
    //   average: { type: Number, default: 0 },
    //   totalReviews: { type: Number, default: 0 },
    // },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    stock: { type: Number, required: true, default: 0 },
    basePrice: { type: Number, required: true, default: 0 },
    gstRate: { type: Number, required: true, default: 0 },
    price: { type: Number, required: true, default: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: Date.now },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Middleware: slugify and sync representative variant price and stock
productSchema.pre("save", function (this: IProduct, next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }

  if (this.variants && this.variants.length > 0) {
    const firstVariant = this.variants[0] as IVariant;

    this.basePrice = firstVariant.basePrice;
    this.gstRate = firstVariant.gstRate;
    this.price = firstVariant.price;

    this.stock = this.variants.reduce((acc, v) => acc + v.stock, 0);
  } else {
    if (this.isModified("basePrice") || this.isModified("gstRate")) {
      this.price = this.basePrice + (this.basePrice * this.gstRate) / 100;
    }
  }

  next();
});

// Indexes for text search and pagination optimization
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
