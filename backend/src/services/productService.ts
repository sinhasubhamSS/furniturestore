// src/services/productService.ts
import { FilterQuery, Types } from "mongoose";
import cloudinary from "../config/cloudinary";
import Category from "../models/category.model";
import Product from "../models/product.models";
import { IProductInput } from "../types/productservicetype";
import { AppError } from "../utils/AppError";
import slugify from "slugify";
import { generateSKU } from "../utils/genetateSku";
import { IVariant } from "../types/productservicetype";

/**
 * ProductService
 * - kept same class-style you had
 * - important changes:
 *   - LISTING_PROJECTION uses rep* denormalized fields (fast for listing & SSR)
 *   - buildSortOptions uses rep* fields
 *   - deleteRemovedImages runs deletes in parallel (faster)
 *   - create/edit call Product.recomputeDenorm(...) after saves
 *   - getLatestProducts uses rep snapshot when available
 *   - mapToListingDTO central mapper for listing consistency
 */

class ProductService {
  // -------------------- helpers --------------------
  private buildSlug(name: string) {
    return slugify(name, { lower: true, strict: true });
  }

  // delete removed cloudinary images in parallel (safer + faster)
  private async deleteRemovedImages(
    oldImages: { public_id: string }[] = [],
    newImages: { public_id: string }[] = []
  ) {
    const newIds = new Set((newImages || []).map((img) => img.public_id));
    const toDelete = (oldImages || []).filter(
      (img) => !newIds.has(img.public_id)
    );

    if (toDelete.length === 0) return;

    // run parallel, catch/log errors per image
    await Promise.all(
      toDelete.map(async (img) => {
        try {
          await cloudinary.uploader.destroy(img.public_id);
        } catch (e) {
          console.error("cloudinary delete error", img.public_id, e);
        }
      })
    );
  }

  // simple pagination helper
  private applyPagination(query: any, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    return query.skip(skip).limit(limit);
  }

  // centralized builder: respects isAdmin and optional creator populate
  private buildProductQuery(
    filter: FilterQuery<IProductInput> = {},
    isAdmin: boolean = false,
    populateCreatedBy: boolean = false
  ) {
    const finalFilter = isAdmin ? filter : { ...filter, isPublished: true };
    let query = Product.find(finalFilter).populate("category", "name");

    if (populateCreatedBy) {
      query = query.populate("createdBy", "name email");
    }

    return query;
  }

  // -------------------- sorting --------------------
  // use rep* fields for listing sorts so UI sort matches listing price shown
  private buildSortOptions(sortBy: string): { [key: string]: 1 | -1 } {
    switch (sortBy) {
      case "price_low":
        return { repDiscountedPrice: 1, repPrice: 1 };
      case "price_high":
        return { repDiscountedPrice: -1, repPrice: -1 };
      case "discount":
        return { repSavings: -1 };
      case "best":
        return { repInStock: -1, repDiscountedPrice: 1 };
      case "latest":
      default:
        return { createdAt: -1 };
    }
  }

  // -------------------- mapping helpers --------------------
  // central DTO for listing -> keep frontend stable and small
  private mapToListingDTO(p: any) {
    return {
      _id: p._id,
      name: p.name,
      slug: p.slug,
      title: p.title,
      image: p.repThumbSafe || p.repImage || "",
      price: p.repPrice ?? p.price ?? null,
      discountedPrice: p.repDiscountedPrice ?? p.lowestDiscountedPrice ?? null,
      inStock: !!p.repInStock,
      totalStock: p.totalStock ?? 0,
      metaTitle: p.metaTitle,
      metaDescription: p.metaDescription,
      createdAt: (p as any).createdAt || null,
    };
  }

  // -------------------- admin ops --------------------
  async createProduct(productData: IProductInput, userId: string) {
    if (!productData.variants || productData.variants.length === 0) {
      throw new AppError("At least one variant is required", 400);
    }

    // process variants: sku, price, discountedPrice, savings, stock normalize
    const processedVariants = productData.variants.map((variant) => {
      if (!variant.images || variant.images.length === 0) {
        throw new AppError("Each variant must have at least one image", 400);
      }

      const sku = generateSKU(productData.name, variant.color, variant.size);
      const gstDecimal = variant.gstRate / 100;
      const price = variant.basePrice + variant.basePrice * gstDecimal;

      let discountedPrice = price;
      let savings = 0;
      const isDiscountValid =
        variant.hasDiscount &&
        variant.discountPercent > 0 &&
        (!variant.discountValidUntil ||
          new Date(variant.discountValidUntil) > new Date());

      if (isDiscountValid) {
        const discountAmount =
          (variant.basePrice * variant.discountPercent) / 100;
        const discountedBasePrice = variant.basePrice - discountAmount;
        discountedPrice =
          discountedBasePrice + discountedBasePrice * gstDecimal;
        savings = price - discountedPrice;
      }

      return {
        ...variant,
        sku,
        price: Math.round(price * 100) / 100,
        discountedPrice: Math.round(discountedPrice * 100) / 100,
        savings: Math.round(savings * 100) / 100,
        stock: variant.stock ?? 0,
      } as IVariant;
    });

    // top-level aggregates
    const minPrice = Math.min(
      ...processedVariants.map((v) => v.price ?? Infinity)
    );
    const minDiscountedPrice = Math.min(
      ...processedVariants.map((v) => v.discountedPrice ?? Infinity)
    );
    const maxSavings = Math.max(
      ...processedVariants.map((v) => v.savings ?? 0)
    );
    const colors = [...new Set(processedVariants.map((v) => v.color))];
    const sizes = [...new Set(processedVariants.map((v) => v.size))];

    const productDocument: IProductInput = {
      ...productData,
      slug: this.buildSlug(productData.name),
      variants: processedVariants as any,
      price: minPrice,
      lowestDiscountedPrice: minDiscountedPrice,
      maxSavings,
      colors,
      sizes,
      createdBy: new Types.ObjectId(userId),
      isPublished: productData.isPublished || false,
    };

    const product = await Product.create(productDocument);

    // ensure rep* snapshot and totals are correct after create
    try {
      await Product.recomputeDenorm(product._id);
    } catch (e) {
      console.error("recomputeDenorm error after create", e);
    }

    return product;
  }

  async editProduct(
    productId: string,
    userId: string,
    updateData: Partial<IProductInput>
  ) {
    const product = await Product.findOne({
      _id: productId,
      createdBy: userId,
    });
    if (!product) throw new AppError("Product not found or unauthorized", 404);

    // slug if name changed
    if (updateData.name && updateData.name !== product.name) {
      product.slug = this.buildSlug(updateData.name);
    }

    // variant updates (if provided)
    if (updateData.variants) {
      if (updateData.variants.length === 0) {
        throw new AppError("At least one variant is required", 400);
      }

      // delete removed images (compare old -> new). safe even if new shorter.
      // note: this loops per-variant index matching. if your frontend reorders variants, adjust logic to compare by public_id or sku.
      for (let i = 0; i < product.variants.length; i++) {
        const oldVariant = product.variants[i];
        const newVariant = updateData.variants[i];
        if (newVariant) {
          await this.deleteRemovedImages(
            oldVariant.images as any,
            newVariant.images as any
          );
        } else {
          // whole variant removed -> delete all its images
          await this.deleteRemovedImages(oldVariant.images as any, []);
        }
      }

      // recalc processed variants (same logic as create)
      const processedVariants: IVariant[] = updateData.variants.map(
        (variant) => {
          if (!variant.images || variant.images.length === 0) {
            throw new AppError(
              "Each variant must have at least one image",
              400
            );
          }

          const sku = generateSKU(
            updateData.name || product.name,
            variant.color,
            variant.size
          );
          const gstDecimal = variant.gstRate / 100;
          const price = variant.basePrice + variant.basePrice * gstDecimal;

          let discountedPrice = price;
          let savings = 0;
          const isDiscountValid =
            variant.hasDiscount &&
            variant.discountPercent > 0 &&
            (!variant.discountValidUntil ||
              new Date(variant.discountValidUntil) > new Date());

          if (isDiscountValid) {
            const discountAmount =
              (variant.basePrice * variant.discountPercent) / 100;
            const discountedBasePrice = variant.basePrice - discountAmount;
            discountedPrice =
              discountedBasePrice + discountedBasePrice * gstDecimal;
            savings = price - discountedPrice;
          }

          return {
            ...variant,
            sku,
            price: Math.round(price * 100) / 100,
            discountedPrice: Math.round(discountedPrice * 100) / 100,
            savings: Math.round(savings * 100) / 100,
            stock: variant.stock ?? 0,
          } as IVariant;
        }
      );

      // replace variants in-place (DocumentArray)
      product.variants.splice(
        0,
        product.variants.length,
        ...(processedVariants as any)
      );

      // update aggregates
      product.price = Math.min(
        ...processedVariants.map((v) => v.price ?? Infinity)
      );
      product.lowestDiscountedPrice = Math.min(
        ...processedVariants.map((v) => v.discountedPrice ?? Infinity)
      );
      product.maxSavings = Math.max(
        ...processedVariants.map((v) => v.savings ?? 0),
        product.maxSavings
      );
      product.colors = [...new Set(processedVariants.map((v) => v.color))];
      product.sizes = [...new Set(processedVariants.map((v) => v.size))];
    }

    // apply other updatable fields (safe list)
    const updatableFields: (keyof IProductInput)[] = [
      "name",
      "title",
      "description",
      "specifications",
      "measurements",
      "warranty",
      "disclaimer",
      "category",
      "isPublished",
    ];
    updatableFields.forEach((field) => {
      if ((updateData as any)[field] !== undefined) {
        (product as any)[field] = (updateData as any)[field];
      }
    });

    await product.save();

    // recompute denorm AFTER save (ensure rep* and totals are in sync)
    try {
      await Product.recomputeDenorm(product._id);
    } catch (e) {
      console.error("recomputeDenorm error after edit", e);
    }

    return product.toObject();
  }

  async deleteProduct(productId: string, userId: string) {
    const product = await Product.findOneAndDelete({
      _id: productId,
      createdBy: userId,
    });
    if (!product) throw new AppError("Product not found or unauthorized", 404);
    // optionally: delete all cloudinary images for safety (not implemented here)
    return product;
  }

  // -------------------- listing & read methods --------------------
  async getAllProducts(
    filter: any = {},
    page: number = 1,
    limit: number = 10,
    isAdmin: boolean = false,
    populateCreatedBy: boolean = false,
    sortBy: string = "latest"
  ) {
    const mongoFilter: any = {};

    // category slug -> id
    if (filter.category) {
      const category = await Category.findOne({ slug: filter.category });
      if (category) {
        mongoFilter.category = category._id;
      } else {
        return { products: [], page, limit, totalPages: 0, totalItems: 0 };
      }
    }

    const sortOptions = this.buildSortOptions(sortBy);

    // LISTING_PROJECTION uses rep* denormalized snapshot (fast)
    const LISTING_PROJECTION: any = {
      _id: 1,
      slug: 1,
      name: 1,
      title: 1,
      repImage: 1,
      repThumbSafe: 1,
      repPrice: 1,
      repDiscountedPrice: 1,
      repSavings: 1,
      repInStock: 1,
      totalStock: 1,
      inStock: 1,
      price: 1,
      lowestDiscountedPrice: 1,
      metaTitle: 1,
      metaDescription: 1,
      searchTags: 1,
      visibleOnHomepage: 1,
      createdAt: 1,
      updatedAt: 1,
    };

    let query = this.buildProductQuery(mongoFilter, isAdmin, populateCreatedBy);

    query = query.select(LISTING_PROJECTION).sort(sortOptions);

    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);

    // run queries in parallel and lean() for performance
    const [products, total] = await Promise.all([
      query.lean(),
      Product.countDocuments(mongoFilter),
    ]);

    // map to listing DTO (centralized)
    const dto = (products || []).map((p: any) => this.mapToListingDTO(p));

    return {
      products: dto,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      totalItems: total,
    };
  }

  // single product helper (full doc)
  private async getSingleProduct(
    query: FilterQuery<IProductInput>,
    isAdmin: boolean = false
  ) {
    const finalQuery = isAdmin ? query : { ...query, isPublished: true };
    const product = await this.buildProductQuery(finalQuery, isAdmin)
      .findOne()
      .lean();
    if (!product) throw new AppError("Product not found", 404);
    return product;
  }

  async getProductBySlug(slug: string, isAdmin: boolean = false) {
    return this.getSingleProduct({ slug }, isAdmin);
  }

  async getProductById(productId: string, isAdmin: boolean = false) {
    return this.getSingleProduct({ _id: productId }, isAdmin);
  }

  // search - returns full results mapped to listing DTO
  async searchProducts(
    searchQuery: string,
    page = 1,
    limit = 10,
    isAdmin: boolean = false
  ) {
    const textSearchFilter = { $text: { $search: searchQuery } };

    const query = this.buildProductQuery(textSearchFilter, isAdmin)
      .sort({ score: { $meta: "textScore" } })
      .select({ score: { $meta: "textScore" } });

    const paginated = this.applyPagination(query, page, limit);

    const finalFilter = isAdmin
      ? textSearchFilter
      : { ...textSearchFilter, isPublished: true };
    const [products, total] = await Promise.all([
      paginated.lean(),
      Product.countDocuments(finalFilter),
    ]);

    const dto = (products || []).map((p: any) => this.mapToListingDTO(p));
    return {
      products: dto,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
    };
  }

  async getProductsByCategory(
    slug: string,
    page = 1,
    limit = 10,
    isAdmin: boolean = false
  ) {
    const category = await Category.findOne({ slug });
    if (!category) throw new AppError("Category not found", 404);

    const categoryFilter = { category: category._id };
    const query = this.buildProductQuery(categoryFilter, isAdmin).sort({
      createdAt: -1,
    });
    const paginated = this.applyPagination(query, page, limit);

    const finalFilter = isAdmin
      ? categoryFilter
      : { ...categoryFilter, isPublished: true };
    const [products, total] = await Promise.all([
      paginated.lean(),
      Product.countDocuments(finalFilter),
    ]);

    const dto = (products || []).map((p: any) => this.mapToListingDTO(p));
    return {
      products: dto,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
    };
  }

  // getLatestProducts -> uses rep snapshot if present, fallbacks to firstVariant
  async getLatestProducts(limit: number = 8, isAdmin: boolean = false) {
    const products = await this.buildProductQuery({}, isAdmin)
      .sort({ createdAt: -1 })
      .limit(limit)
      .select(
        "name slug variants category repImage repThumbSafe repPrice repDiscountedPrice createdAt"
      )
      .lean();

    return products.map((product: any) => {
      const firstVariant = Array.isArray(product.variants)
        ? product.variants[0]
        : undefined;

      return {
        _id: product._id,
        name: product.name,
        slug: product.slug,
        category: product.category,
        image:
          product.repThumbSafe ||
          product.repImage ||
          firstVariant?.images?.[0]?.url ||
          "",
        price: product.repPrice ?? firstVariant?.price ?? null,
        discountedPrice:
          product.repDiscountedPrice ?? firstVariant?.discountedPrice ?? null,
        hasDiscount:
          (product.repDiscountedPrice ?? firstVariant?.discountedPrice) <
          (product.repPrice ?? firstVariant?.price ?? Infinity),
        createdAt: (product as any).createdAt || null,
      };
    });
  }

  async getFeaturedProducts(limit: number = 8, isAdmin: boolean = false) {
    const featuredFilter = { "reviewStats.averageRating": { $gte: 4 } };
    const products = await this.buildProductQuery(featuredFilter, isAdmin)
      .sort({ "reviewStats.averageRating": -1, "reviewStats.totalReviews": -1 })
      .limit(limit)
      .lean();

    const dto = (products || []).map((p: any) => this.mapToListingDTO(p));
    return dto;
  }

  // -------------------- admin shortcuts --------------------
  async getAllProductsAdmin(filter = {}, page: number = 1, limit: number = 10) {
    return this.getAllProducts(filter, page, limit, true, true);
  }

  async getProductByIdAdmin(productId: string) {
    return this.getProductById(productId, true);
  }
}

// export instance
export const productService = new ProductService();
export default productService;
