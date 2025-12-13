// controllers/reviewController.ts
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
    // Normalize incoming body (protect against undefined)
    const safeBody = req.body ?? {};

    // Our createReviewSchema expects an object shaped like { body: { ... } }
    const parsed = createReviewSchema.safeParse({ body: safeBody });

    if (!parsed.success) {
      console.warn("createReview validation errors:", parsed.error.errors);
      return res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.errors,
        receivedBody: safeBody,
      });
    }

    const validatedData = parsed.data.body;
    console.debug(
      "createReview - validatedData:",
      JSON.stringify(validatedData)
    );

    // Ensure user is authenticated
    if (!req.userId) {
      throw new AppError("Authentication required", 401);
    }

    // Normalize orderId if present (non-empty string) — avoid sending empty string to service
    const rawOrderId = validatedData?.orderId;
    const normalizedOrderId =
      typeof rawOrderId === "string" && rawOrderId.trim().length > 0
        ? rawOrderId.trim()
        : undefined;

    const reviewData: any = {
      ...validatedData,
      userId: req.userId,
      productId: req.params.productId,
    };

    if (normalizedOrderId) reviewData.orderId = normalizedOrderId;
    else delete reviewData.orderId;

    console.debug(
      "createReview - service payload:",
      JSON.stringify(reviewData)
    );

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
  getProductReviews = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { productId } = req.params;

      if (!productId) {
        throw new AppError("Product ID is required", 400);
      }

      // Validate/normalize query params using zod schema (expects top-level keys)
      const rawQuery = {
        page: req.query.page,
        limit: req.query.limit,
        sortBy: req.query.sortBy,
        sortOrder: req.query.sortOrder,
        rating: req.query.rating,
        hasImages: req.query.hasImages,
        hasVideos: req.query.hasVideos,
        verified: req.query.verified,
      };

      const parsed = reviewQuerySchema.safeParse(rawQuery);
      if (!parsed.success) {
        console.warn("getProductReviews - invalid query:", parsed.error.errors);
        // fallback to defaults if validation fails
        // (or return 400 — choose fallback for better UX)
      }

      const q = parsed.success ? parsed.data : parsed; // parsed may be error but we will fallback below

      const page = parsed.success
        ? parsed.data.page
        : Number(req.query.page) || 1;
      const limit = parsed.success
        ? parsed.data.limit
        : Number(req.query.limit) || 10;
      const sortBy = parsed.success
        ? parsed.data.sortBy
        : (req.query.sortBy as string) || "createdAt";
      const sortOrder = parsed.success
        ? parsed.data.sortOrder
        : (req.query.sortOrder as string) || "desc";
      const rating =
        parsed.success && parsed.data.rating
          ? parsed.data.rating
          : req.query.rating
          ? Number(req.query.rating)
          : undefined;
      const hasImages = parsed.success ? parsed.data.hasImages : undefined;
      const hasVideos = parsed.success ? parsed.data.hasVideos : undefined;
      const verified = parsed.success ? parsed.data.verified : undefined;

      const result = await ReviewService.getProductReviews(
        productId,
        page,
        limit,
        sortBy,
        sortOrder,
        rating,
        // hasImages,
        // hasVideos,
        // verified
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

      // Validate both params and body using safeParse
      const parsed = updateReviewSchema.safeParse({
        params: { reviewId },
        body: req.body ?? {},
      });

      if (!parsed.success) {
        console.warn("updateReview validation errors:", parsed.error.errors);
        return res.status(400).json({
          message: "Validation failed",
          errors: parsed.error.errors,
        });
      }

      const validatedData = parsed.data.body;

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
