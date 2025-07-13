// services/category.service.ts
import Category, { ICategory } from "../models/category.model";

interface CreateCategoryInput {
  name: string;
  image: {
    url: string;
    public_id: string;
  };
}

class CategoryService {
  async createCategory(data: CreateCategoryInput): Promise<ICategory> {
    const existing = await Category.findOne({ name: data.name });
    if (existing) throw new Error("Category already exists");

    const newCategory = new Category(data);
    return await newCategory.save();
  }



  async getAllCategories(): Promise<ICategory[]> {
    return await Category.find().sort({ createdAt: -1 });
  }
}

// 👇 Export an instance (singleton)
export const categoryService = new CategoryService();
