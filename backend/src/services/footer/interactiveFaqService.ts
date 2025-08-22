import { InteractiveFAQ } from "../../models/footer/interactiveFaq.models";
import { AppError } from "../../utils/AppError";

// Define category type
type CategoryType = "products" | "orders" | "payment" | "general";

export class InteractiveFAQService {
  // 1️⃣ Get welcome screen categories
  async getMainCategories() {
    try {
      const categories = await InteractiveFAQ.aggregate([
        { $match: { isActive: true, parentQuestionId: { $exists: false } } },
        {
          $group: {
            _id: "$category",
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      return categories.map((cat) => ({
        category: cat._id,
        title: this.getCategoryTitle(cat._id as CategoryType),
        description: this.getCategoryDescription(cat._id as CategoryType),
        questionCount: cat.count,
      }));
    } catch (error: any) {
      throw new AppError(`Failed to fetch categories: ${error.message}`, 500);
    }
  }

  // 2️⃣ Get questions when user clicks category
  async getQuestionsByCategory(category: string) {
    try {
      const questions = await InteractiveFAQ.find({
        category,
        isActive: true,
        parentQuestionId: { $exists: false },
      })
        .sort({ displayOrder: 1 })
        .select("question shortAnswer category")
        .lean();

      return questions;
    } catch (error: any) {
      throw new AppError(`Failed to fetch questions: ${error.message}`, 500);
    }
  }

  // 3️⃣ Get full FAQ details when user clicks question
  async getFAQById(id: string) {
    try {
      const faq = await InteractiveFAQ.findById(id)
        .populate("followUpQuestions", "question shortAnswer")
        .lean();

      if (!faq) {
        throw new AppError("FAQ not found", 404);
      }

      // Update view count in background
      InteractiveFAQ.findByIdAndUpdate(id, { $inc: { viewCount: 1 } }).exec();

      return faq;
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Failed to fetch FAQ: ${error.message}`, 500);
    }
  }

  // 4️⃣ Search FAQs
  async searchFAQs(query: string) {
    try {
      const searchRegex = new RegExp(query, "i");

      const faqs = await InteractiveFAQ.find({
        $or: [
          { question: searchRegex },
          { shortAnswer: searchRegex },
          { tags: { $in: [searchRegex] } },
        ],
        isActive: true,
      })
        .sort({ viewCount: -1 })
        .limit(8)
        .select("question shortAnswer category")
        .lean();

      return faqs;
    } catch (error: any) {
      throw new AppError(`Failed to search FAQs: ${error.message}`, 500);
    }
  }

  // 5️⃣ User feedback (helpful/not helpful)
  async submitFeedback(faqId: string, isHelpful: boolean) {
    try {
      const updateField = isHelpful ? "helpfulCount" : "notHelpfulCount";

      await InteractiveFAQ.findByIdAndUpdate(faqId, {
        $inc: { [updateField]: 1 },
      });

      return { success: true };
    } catch (error: any) {
      throw new AppError(`Failed to submit feedback: ${error.message}`, 500);
    }
  }

  // Helper: Category titles
  private getCategoryTitle(category: CategoryType): string {
    const titles: Record<CategoryType, string> = {
      products: "🛋️ Products & Catalog",
      orders: "📦 Orders & Delivery",
      payment: "💳 Payment & Pricing",
      general: "❓ General Questions",
    };
    return titles[category];
  }

  // Helper: Category descriptions
  private getCategoryDescription(category: CategoryType): string {
    const descriptions: Record<CategoryType, string> = {
      products: "Sofas, beds, decorative items",
      orders: "Track, modify, return orders",
      payment: "Payment methods, EMI, offers",
      general: "Other questions and support",
    };
    return descriptions[category];
  }
}
