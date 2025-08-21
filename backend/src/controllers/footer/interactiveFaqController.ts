import { Request, Response } from "express";
import { AppError } from "../../utils/AppError";
import { ApiResponse } from "../../utils/ApiResponse";
import { catchAsync } from "../../utils/catchAsync";
import { InteractiveFAQService } from "../../services/footer/interactiveFaqService";

const interactiveFAQService = new InteractiveFAQService();

export class InteractiveFAQController {
  // 1️⃣ Welcome screen - show categories
  getMainCategories = catchAsync(
    async (req: Request, res: Response): Promise<void> => {
      const categories = await interactiveFAQService.getMainCategories();

      res
        .status(200)
        .json(
          new ApiResponse(200, { categories }, "Categories loaded successfully")
        );
    }
  );

  // 2️⃣ Show questions for selected category
  getCategoryQuestions = catchAsync(
    async (req: Request, res: Response): Promise<void> => {
      const { category } = req.params;

      if (!category) {
        throw new AppError("Category is required", 400);
      }

      const questions = await interactiveFAQService.getQuestionsByCategory(
        category
      );

      res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { questions, category },
            "Questions loaded successfully"
          )
        );
    }
  );

  // 3️⃣ Show full answer when question clicked
  getFAQDetails = catchAsync(
    async (req: Request, res: Response): Promise<void> => {
      const { id } = req.params;

      if (!id) {
        throw new AppError("FAQ ID is required", 400);
      }

      const faq = await interactiveFAQService.getFAQById(id);

      res
        .status(200)
        .json(new ApiResponse(200, { faq }, "FAQ details loaded successfully"));
    }
  );

  // 4️⃣ Search functionality
  searchFAQs = catchAsync(
    async (req: Request, res: Response): Promise<void> => {
      const { query } = req.query;

      if (!query || typeof query !== "string") {
        throw new AppError("Search query is required", 400);
      }

      const results = await interactiveFAQService.searchFAQs(query);

      res
        .status(200)
        .json(new ApiResponse(200, { results, query }, "Search completed"));
    }
  );

  // 5️⃣ User feedback
  submitFeedback = catchAsync(
    async (req: Request, res: Response): Promise<void> => {
      const { faqId, isHelpful } = req.body;

      if (!faqId || typeof isHelpful !== "boolean") {
        throw new AppError("FAQ ID and feedback are required", 400);
      }

      await interactiveFAQService.submitFeedback(faqId, isHelpful);

      res
        .status(200)
        .json(new ApiResponse(200, {}, "Thank you for your feedback!"));
    }
  );
}
