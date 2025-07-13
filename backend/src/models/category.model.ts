import { Schema, model, models, Document } from "mongoose";
import slugify from "slugify";

// Interface
export interface ICategory extends Document {
  name: string;
  slug: string;
  image: {
    url: string;
    public_id: string;
  };
  createdAt: Date;
}

// Schema
const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      unique: true,
    },
    image: {
      url: {
        type: String,
        required: true,
      },
      public_id: {
        type: String,
        required: true,
      },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Auto-generate slug before saving
categorySchema.pre("save", function (next) {
  if (!this.isModified("name")) return next();
  this.slug = slugify(this.name, { lower: true });
  next();
});

// Export model
const Category =
  models.Category || model<ICategory>("Category", categorySchema);
export default Category;
