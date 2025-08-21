import { Request, Response } from "express";
import { AppError } from "../../utils/AppError";
import { ApiResponse } from "../../utils/ApiResponse";
import { catchAsync } from "../../utils/catchAsync";
import { NewsletterService } from "../../services/footer/newsLetter.Service";
import { newsletterPreferencesSchema, newsletterSubscribeSchema, newsletterUnsubscribeSchema } from "../../validations/footer/newsLetter.validation";

const newsletterService = new NewsletterService();

export class NewsletterController {
  // Subscribe to newsletter
  subscribe = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const validatedData = newsletterSubscribeSchema.parse(req.body);

    const result = await newsletterService.subscribe(validatedData);

    const message = result.isReactivated
      ? "Welcome back! Your subscription has been reactivated"
      : "Subscription successful! Please check your email to verify";

    res.status(201).json(
      new ApiResponse(
        201,
        {
          email: result.subscriber.email,
          preferences: result.subscriber.preferences,
          isVerified: result.subscriber.isVerified,
          isReactivated: result.isReactivated,
        },
        message
      )
    );
  });

  // Verify email subscription
  verifyEmail = catchAsync(
    async (req: Request, res: Response): Promise<void> => {
      const { token } = req.params;

      if (!token) {
        throw new AppError("Verification token is required", 400);
      }

      const subscriber = await newsletterService.verifyEmail(token);

      res.status(200).json(
        new ApiResponse(
          200,
          {
            email: subscriber.email,
            isVerified: subscriber.isVerified,
          },
          "Email verified successfully! Welcome to our newsletter"
        )
      );
    }
  );

  // Unsubscribe from newsletter
  unsubscribe = catchAsync(
    async (req: Request, res: Response): Promise<void> => {
      const validatedData = newsletterUnsubscribeSchema.parse(req.body);

      const subscriber = await newsletterService.unsubscribe(validatedData);

      res.status(200).json(
        new ApiResponse(
          200,
          {
            email: subscriber.email,
            unsubscribedAt: subscriber.unsubscribedAt,
          },
          "Successfully unsubscribed from newsletter"
        )
      );
    }
  );

  // Update newsletter preferences
  updatePreferences = catchAsync(
    async (req: Request, res: Response): Promise<void> => {
      const validatedData = newsletterPreferencesSchema.parse(req.body);

      const subscriber = await newsletterService.updatePreferences(
        validatedData
      );

      res.status(200).json(
        new ApiResponse(
          200,
          {
            email: subscriber.email,
            preferences: subscriber.preferences,
          },
          "Newsletter preferences updated successfully"
        )
      );
    }
  );

  // Get subscriber details
  getSubscriber = catchAsync(
    async (req: Request, res: Response): Promise<void> => {
      const { email } = req.query;

      if (!email || typeof email !== "string") {
        throw new AppError("Email is required", 400);
      }

      const subscriber = await newsletterService.getSubscriber(email);

      if (!subscriber) {
        throw new AppError("Subscriber not found", 404);
      }

      res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { subscriber },
            "Subscriber details fetched successfully"
          )
        );
    }
  );

  // Get subscribers with pagination (Admin)
  getSubscribersWithPagination = catchAsync(
    async (req: Request, res: Response): Promise<void> => {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const isActive =
        req.query.isActive === "true"
          ? true
          : req.query.isActive === "false"
          ? false
          : undefined;
      const isVerified =
        req.query.isVerified === "true"
          ? true
          : req.query.isVerified === "false"
          ? false
          : undefined;
      const source = req.query.source as string;

      const result = await newsletterService.getSubscribersWithPagination({
        page,
        limit,
        isActive,
        isVerified,
        source,
      });

      res.status(200).json(
        new ApiResponse(
          200,
          {
            subscribers: result.subscribers,
            pagination: {
              currentPage: page,
              totalPages: result.totalPages,
              totalSubscribers: result.totalCount,
              hasNext: page < result.totalPages,
              hasPrev: page > 1,
            },
          },
          "Subscribers fetched successfully"
        )
      );
    }
  );

  // Get newsletter statistics (Admin)
  getNewsletterStats = catchAsync(
    async (req: Request, res: Response): Promise<void> => {
      const stats = await newsletterService.getNewsletterStats();

      res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { stats },
            "Newsletter statistics fetched successfully"
          )
        );
    }
  );

  // Search subscribers (Admin)
  searchSubscribers = catchAsync(
    async (req: Request, res: Response): Promise<void> => {
      const { query } = req.query;

      if (!query || typeof query !== "string") {
        throw new AppError("Search query is required", 400);
      }

      const subscribers = await newsletterService.searchSubscribers(
        query as string
      );

      res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { subscribers },
            "Search results fetched successfully"
          )
        );
    }
  );
}
