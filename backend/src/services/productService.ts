// services/product.service.ts
import { FilterQuery, Types } from "mongoose";
import cloudinary from "../config/cloudinary";
import Category from "../models/category.model";
import Product from "../models/product.models";
import { IProductInput } from "../types/productservicetype";
import { AppError } from "../utils/AppError";
import slugify from "slugify";
import { generateSKU } from "../utils/genetateSku";
import { IVariant } from "../types/productservicetype";
// IMPORTANT: updated names from utils/pricing
import { computeVariantFromBase } from "../utils/pricing";

class ProductService {
  private buildSlug(name: string) {
    return slugify(name, { lower: true, strict: true });
  }

  private validateImages(images: any[] = []) {
    if (!Array.isArray(images) || images.length === 0) return false;
    const readPublicId = (img: any) =>
      img?.public_id || img?.publicId || img?.publicIdStr || null;
    const allHaveUrl = images.every(
      (img) => img && typeof img.url === "string" && img.url.length > 0
    );
    if (!allHaveUrl) return false;
    const anyWithPublicId = images.some((img) => {
      const pid = readPublicId(img);
      return typeof pid === "string" && pid.length > 0;
    });
    return anyWithPublicId;
  }

  private normalizeImages(images: any[] = []) {
    const normalized = (images || []).map((img: any) => {
      const public_id =
        img?.public_id || img?.publicId || img?.publicIdStr || "";
      return {
        url: typeof img?.url === "string" ? img.url : "",
        public_id: public_id || undefined,
        thumbSafe: img?.thumbSafe || img?.thumb_safe || img?.thumb || undefined,
        isPrimary: !!img?.isPrimary,
      };
    });

    if (normalized.length === 0) return normalized;

    const firstPrimaryIndex = normalized.findIndex((i) => i.isPrimary);
    if (firstPrimaryIndex >= 0) {
      normalized.forEach((n, idx) => {
        n.isPrimary = idx === firstPrimaryIndex;
      });
    } else {
      normalized.forEach((n, idx) => {
        n.isPrimary = idx === 0;
      });
    }

    return normalized;
  }

  private async deleteRemovedImages(
    oldImages: { public_id: string }[] = [],
    newImages: { public_id: string }[] = []
  ) {
    const newIds = new Set((newImages || []).map((img) => img.public_id));
    const toDelete = (oldImages || []).filter(
      (img) => !newIds.has(img.public_id)
    );
    if (toDelete.length === 0) return;
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

  private async deletePublicIds(publicIds: string[] = []) {
    if (!publicIds || publicIds.length === 0) return;
    await Promise.all(
      publicIds.map(async (id) => {
        try {
          await cloudinary.uploader.destroy(id);
        } catch (e) {
          console.error("cloudinary delete error", id, e);
        }
      })
    );
  }

  private applyPagination(query: any, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    return query.skip(skip).limit(limit);
  }

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

  private buildSortOptions(sortBy: string): { [key: string]: 1 | -1 } {
    switch (sortBy) {
      case "price_low":
        return { repDiscountedPrice: 1, repPrice: 1 };
      case "price_high":
        return { repDiscountedPrice: -1, repPrice: -1 };
      case "discount":
        return { maxSavings: -1, repDiscountedPrice: 1 };
      case "best":
        return { repInStock: -1, repDiscountedPrice: 1 };
      case "latest":
      default:
        return { createdAt: -1 };
    }
  }

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

    const processedVariants = productData.variants.map((variant) => {
      if (!this.validateImages(variant.images)) {
        throw new AppError(
          "Each variant must have at least one valid uploaded image (url + public_id).",
          400
        );
      }

      const images = this.normalizeImages(variant.images);
      const sku = generateSKU(productData.name, variant.color, variant.size);

      // Validate required basePrice & gstRate (base-first approach)
      if (typeof variant.basePrice !== "number" || variant.basePrice <= 0) {
        throw new AppError(
          "variant.basePrice is required and must be > 0",
          400
        );
      }
      if (typeof variant.gstRate !== "number" || variant.gstRate < 0) {
        throw new AppError("variant.gstRate is required and must be >= 0", 400);
      }

      // compute pricing using base-first computeVariantFromBase(base, gstRate, listing?)
      const pricing = computeVariantFromBase(
        Math.round(variant.basePrice * 100) / 100,
        variant.gstRate,
        variant.listingPrice ?? undefined
      );

      return {
        ...variant,
        images,
        sku,
        basePrice: Math.round(variant.basePrice * 100) / 100,
        gstRate: variant.gstRate,
        gstAmount: pricing.gstAmount,
        sellingPrice: pricing.sellingPrice,
        price: pricing.listingPrice, // legacy listing price
        discountedPrice: pricing.sellingPrice, // legacy discounted
        savings: pricing.savings,
        discountPercent: pricing.discountPercent ?? 0,
        stock: variant.stock ?? 0,
      } as IVariant;
    });

    const minPrice = Math.min(
      ...processedVariants.map((v: any) => v.price ?? Infinity)
    );
    const minDiscountedPrice = Math.min(
      ...processedVariants.map((v: any) => v.discountedPrice ?? Infinity)
    );
    const maxSavings = Math.max(
      ...processedVariants.map((v: any) => v.savings ?? 0)
    );

    const productDocument: IProductInput = {
      ...productData,
      slug: this.buildSlug(productData.name),
      variants: processedVariants as any,
      price: Math.round(minPrice * 100) / 100,
      lowestDiscountedPrice: Math.round(minDiscountedPrice * 100) / 100,
      maxSavings: Math.round(maxSavings * 100) / 100,
      createdBy: new Types.ObjectId(userId),
      isPublished: productData.isPublished || false,
    };

    const product = await Product.create(productDocument);

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

    // ---------- slug ----------
    if (updateData.name && updateData.name !== product.name) {
      product.slug = this.buildSlug(updateData.name);
    }

    // ---------- variants ----------
    if (updateData.variants) {
      if (updateData.variants.length === 0) {
        throw new AppError("At least one variant is required", 400);
      }

      /* ----- delete removed images ----- */
      const oldPublicIds = new Set<string>();
      product.variants.forEach((v: any) => {
        (v.images || []).forEach((img: any) => {
          if (img?.public_id) oldPublicIds.add(img.public_id);
        });
      });

      const newPublicIds = new Set<string>();
      updateData.variants.forEach((v: any) => {
        (v.images || []).forEach((img: any) => {
          if (img?.public_id) newPublicIds.add(img.public_id);
        });
      });

      const toDeleteIds = [...oldPublicIds].filter(
        (id) => !newPublicIds.has(id)
      );
      await this.deletePublicIds(toDeleteIds);

      /* ----- rebuild variants ----- */
      const processedVariants: IVariant[] = updateData.variants.map(
        (variant) => {
          if (!this.validateImages(variant.images)) {
            throw new AppError(
              "Each variant must have at least one valid image (url + public_id)",
              400
            );
          }

          if (typeof variant.basePrice !== "number" || variant.basePrice <= 0) {
            throw new AppError("variant.basePrice must be > 0", 400);
          }

          if (typeof variant.gstRate !== "number" || variant.gstRate < 0) {
            throw new AppError("variant.gstRate must be >= 0", 400);
          }

          const images = this.normalizeImages(variant.images);
          const sku = generateSKU(
            updateData.name || product.name,
            variant.color,
            variant.size
          );

          const pricing = computeVariantFromBase(
            Math.round(variant.basePrice * 100) / 100,
            variant.gstRate,
            variant.listingPrice ?? undefined
          );

          return {
            ...variant,
            images,
            sku,
            basePrice: pricing.base,
            gstRate: variant.gstRate,
            gstAmount: pricing.gstAmount,
            sellingPrice: pricing.sellingPrice,
            listingPrice: pricing.listingPrice,
            savings: pricing.savings,
            discountPercent: pricing.discountPercent ?? 0,
            hasDiscount: pricing.savings > 0,
            stock: variant.stock ?? 0,
          } as IVariant;
        }
      );

      /* ----- replace variants atomically ----- */
      product.variants.splice(
        0,
        product.variants.length,
        ...(processedVariants as any)
      );

      /* ----- product-level aggregates ----- */
      product.lowestSellingPrice = Math.min(
        ...processedVariants.map((v) => v.sellingPrice ?? Infinity)
      );

      product.maxSavings = Math.max(
        ...processedVariants.map((v) => v.savings ?? Infinity),
        0
      );
    }

    // ---------- simple fields ----------
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

    // ---------- denormalized sync ----------
    try {
      await Product.recomputeDenorm(product._id);
    } catch (e) {
      console.error("recomputeDenorm error after edit", e);
    }

    return product.toObject();
  }

  async deleteProduct(productId: string, userId: string) {
    const product = await Product.findOne({
      _id: productId,
      createdBy: userId,
    });
    if (!product) throw new AppError("Product not found or unauthorized", 404);

    const publicIds: string[] = [];
    (product.variants || []).forEach((v: any) => {
      (v.images || []).forEach((img: any) => {
        if (img?.public_id) publicIds.push(img.public_id);
      });
    });

    await this.deletePublicIds(publicIds);

    await product.deleteOne();

    return product;
  }

  // -------------------- listing & read methods --------------------
  async getAllProducts(
    filter: any = {},
    page: number = 1,
    limit = 10,
    isAdmin: boolean = false,
    populateCreatedBy: boolean = false,
    sortBy: string = "latest"
  ) {
    const mongoFilter: any = {};
    if (filter.category) {
      const category = await Category.findOne({ slug: filter.category });
      if (category) {
        mongoFilter.category = category._id;
      } else {
        return { products: [], page, limit, totalPages: 0, totalItems: 0 };
      }
    }

    const sortOptions = this.buildSortOptions(sortBy);

    const LISTING_PROJECTION: any = {
      _id: 1,
      slug: 1,
      name: 1,
      title: 1,
      repImage: 1,
      repThumbSafe: 1,
      repPrice: 1,
      repDiscountedPrice: 1,
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
      category: 1,
    };

    const finalFilter = isAdmin
      ? mongoFilter
      : { ...mongoFilter, isPublished: true };
    let query = this.buildProductQuery(finalFilter, isAdmin, populateCreatedBy);

    query = query.select(LISTING_PROJECTION).sort(sortOptions);

    // use helper for pagination
    query = this.applyPagination(query, page, limit);

    const [products, total] = await Promise.all([
      query.lean(),
      Product.countDocuments(finalFilter),
    ]);

    const dto = (products || []).map((p: any) => {
      const base = this.mapToListingDTO(p);

      const repPriceVal =
        typeof p.repPrice !== "undefined" ? p.repPrice : p.price ?? null;
      const repDiscountedVal =
        typeof p.repDiscountedPrice !== "undefined"
          ? p.repDiscountedPrice
          : p.lowestDiscountedPrice ?? null;
      const repSavings =
        repPriceVal && repDiscountedVal
          ? Math.round((repPriceVal - repDiscountedVal) * 100) / 100
          : 0;

      return {
        ...base,
        repThumbSafe: p.repThumbSafe ?? null,
        repImage: p.repImage ?? null,
        repPrice: repPriceVal,
        repDiscountedPrice: repDiscountedVal,
        repSavings,
        repInStock:
          typeof p.repInStock !== "undefined" ? p.repInStock : !!p.inStock,
        category: p.category?.name
          ? { name: p.category.name, _id: p.category._id }
          : p.category,
      };
    });

    return {
      products: dto,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      totalItems: total,
    };
  }

  async getLatestProducts(limit: number = 8, isAdmin: boolean = false) {
    const query = this.buildProductQuery({}, isAdmin)
      .sort({ createdAt: -1 })
      .select(
        "name slug variants category repImage repThumbSafe repPrice repDiscountedPrice createdAt"
      );

    const paginated = this.applyPagination(query, 1, limit).lean();
    const products = await paginated;

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

  async getAllProductsAdmin(filter = {}, page: number = 1, limit = 10) {
    const mongoFilter: any = filter || {};

    if (mongoFilter.category && typeof mongoFilter.category === "string") {
      const cat = await Category.findOne({ slug: mongoFilter.category });
      if (cat) mongoFilter.category = cat._id;
    }

    const skip = (page - 1) * limit;

    let query = Product.find(mongoFilter)
      .populate("category", "name slug")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const [products, total] = await Promise.all([
      query,
      Product.countDocuments(mongoFilter),
    ]);

    return {
      products,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      totalItems: total,
    };
  }

  async getProductByIdAdmin(productId: string) {
    return this.getProductById(productId, true);
  }

  // -------------------- NEW / MISSING METHODS ADDED --------------------

  /**
   * Search products by text (uses text index)
   */
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

  /**
   * Get products by category slug (returns listing DTO)
   */
  async getProductsByCategory(
    slug: string,
    page = 1,
    limit = 10,
    isAdmin: boolean = false
  ) {
    const category = await Category.findOne({ slug });
    if (!category) throw new AppError("Category not found", 404);

    const categoryFilter = { category: category._id };
    let query = this.buildProductQuery(categoryFilter, isAdmin).sort({
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

  // -------------------- helpers for single product --------------------
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
}

export const productService = new ProductService();
export default productService;
