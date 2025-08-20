import { Request, Response, NextFunction } from "express";
import { ReviewService } from "../services/reviewService";
import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../utils/AppError";
import { ApiResponse } from "../utils/ApiResponse";
import { AuthRequest } from "../types/app-request";
import {
  createReviewSchema,
  updateReviewSchema,
  reviewQuerySchema,
} from "../validations/review.validation";

class ReviewController {
  // Create review
  createReview = catchAsync(async (req: AuthRequest, res: Response) => {
    // Zod validation - destructure body
    const { body: validatedData } = createReviewSchema.parse({
      body: req.body,
    });
    console.log(req.body);

    // Ensure userId exists
    if (!req.userId) {
      throw new AppError("Authentication required", 401);
    }

    const reviewData = {
      ...validatedData,
      userId: req.userId, // Now guaranteed to be string
      productId: req.params.productId, // Get productId from route params
    };

    const review = await ReviewService.createReview(reviewData);

    res
      .status(201)
      .json(new ApiResponse(201, review, "Review created successfully"));
  });

  // Get single review by ID
  getReviewById = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { reviewId } = req.params;

      if (!reviewId) {
        throw new AppError("Review ID is required", 400);
      }

      const review = await ReviewService.getReviewById(reviewId);

      if (!review) {
        throw new AppError("Review not found", 404);
      }

      res
        .status(200)
        .json(new ApiResponse(200, review, "Review fetched successfully"));
    }
  );

  // Get product reviews with pagination and filters
  // ReviewController में getProductReviews method को update करें:
  getProductReviews = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { productId } = req.params;

      if (!productId) {
        throw new AppError("Product ID is required", 400);
      }

      // ✅ Extract query parameters with defaults
      const {
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "desc",
        rating,
      } = req.query;

      const result = await ReviewService.getProductReviews(
        productId,
        parseInt(page as string),
        parseInt(limit as string),
        sortBy as string,
        sortOrder as string,
        rating ? parseInt(rating as string) : undefined
      );

      res
        .status(200)
        .json(
          new ApiResponse(200, result, "Product reviews fetched successfully")
        );
    }
  );

  // Update review
  updateReview = catchAsync(
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      const { reviewId } = req.params;

      if (!reviewId || !req.userId) {
        throw new AppError("Review ID and authentication required", 400);
      }

      // Zod validation for update data - destructure body
      const { body: validatedData } = updateReviewSchema.parse({
        params: { reviewId },
        body: req.body,
      });

      const review = await ReviewService.updateReview(
        reviewId,
        req.userId,
        validatedData
      );

      res
        .status(200)
        .json(new ApiResponse(200, review, "Review updated successfully"));
    }
  );

  // Delete review
  deleteReview = catchAsync(
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      const { reviewId } = req.params;

      if (!reviewId || !req.userId) {
        throw new AppError("Review ID and authentication required", 400);
      }

      const success = await ReviewService.deleteReview(reviewId, req.userId);

      res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { deleted: success },
            "Review deleted successfully"
          )
        );
    }
  );
}

export default new ReviewController();
