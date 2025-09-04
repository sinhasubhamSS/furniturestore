import mongoose from "mongoose";

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export class PaginationService {
  /**
   * Generic pagination service for any Mongoose model
   */
  static async paginate<T>(
    model: mongoose.Model<any>,
    query: any = {},
    page: number = 1,
    limit: number = 10,
    options: {
      populate?: string | string[];
      select?: string;
      sort?: any;
    } = {}
  ): Promise<PaginationResult<T>> {
    const skip = (page - 1) * limit;

    // Build query chain
    let queryChain = model.find(query).skip(skip).limit(limit);

    if (options.select) {
      queryChain = queryChain.select(options.select);
    }

    if (options.sort) {
      queryChain = queryChain.sort(options.sort);
    }

    if (options.populate) {
      if (Array.isArray(options.populate)) {
        options.populate.forEach((pop) => {
          queryChain = queryChain.populate(pop);
        });
      } else {
        // ✅ Handle "user" populate specifically
        if (options.populate === "user") {
          queryChain = queryChain.populate({
            path: "user",
            select: "name email mobile",
          });
        } else {
          queryChain = queryChain.populate(options.populate);
        }
      }
    }

    // Execute queries in parallel
    const [data, total] = await Promise.all([
      queryChain.lean(),
      model.countDocuments(query),
    ]);

    const pages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        pages,
        hasNext: page < pages,
        hasPrev: page > 1,
      },
    };
  }
}
