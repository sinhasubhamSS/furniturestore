

import { AppError } from "../../utils/AppError";
import crypto from "crypto";
import { NewsletterPreferencesInput, NewsletterSubscribeInput, NewsletterUnsubscribeInput } from "../../validations/footer/newsLetter.validation";
import { Newsletter } from "../../models/footer/newsLetter";

export class NewsletterService {
  // Subscribe to newsletter
  async subscribe(subscribeData: NewsletterSubscribeInput) {
    try {
      // Check if email already exists
      const existingSubscriber = await Newsletter.findOne({
        email: subscribeData.email,
      });

      if (existingSubscriber) {
        if (existingSubscriber.isActive) {
          throw new AppError("Email already subscribed to newsletter", 400);
        } else {
          // Reactivate subscription
          existingSubscriber.isActive = true;
          existingSubscriber.preferences = subscribeData.preferences || [
            "offers",
            "new_products",
          ];
          existingSubscriber.unsubscribedAt = undefined;
          await existingSubscriber.save();

          // Send welcome back email
          this.sendWelcomeEmail(existingSubscriber).catch(console.error);

          return {
            subscriber: existingSubscriber,
            isReactivated: true,
          };
        }
      }

      // Create new subscriber
      const subscriber = new Newsletter({
        ...subscribeData,
        isVerified: false, // Email verification required
      });

      await subscriber.save();

      // Send verification email
      this.sendVerificationEmail(subscriber).catch(console.error);

      return {
        subscriber,
        isReactivated: false,
      };
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Failed to subscribe: ${error.message}`, 500);
    }
  }

  // Verify email subscription
  async verifyEmail(token: string) {
    try {
      const subscriber = await Newsletter.findOne({
        verificationToken: token,
        isVerified: false,
      });

      if (!subscriber) {
        throw new AppError("Invalid or expired verification token", 400);
      }

      subscriber.isVerified = true;
      subscriber.verificationToken = undefined;
      await subscriber.save();

      // Send welcome email
      this.sendWelcomeEmail(subscriber).catch(console.error);

      return subscriber;
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Failed to verify email: ${error.message}`, 500);
    }
  }

  // Unsubscribe from newsletter
  async unsubscribe(unsubscribeData: NewsletterUnsubscribeInput) {
    try {
      const query: any = { email: unsubscribeData.email };

      // If token provided, validate it
      if (unsubscribeData.token) {
        query.unsubscribeToken = unsubscribeData.token;
      }

      const subscriber = await Newsletter.findOne(query);

      if (!subscriber) {
        throw new AppError("Subscriber not found", 404);
      }

      if (!subscriber.isActive) {
        throw new AppError("Email already unsubscribed", 400);
      }

      subscriber.isActive = false;
      subscriber.unsubscribedAt = new Date();
      await subscriber.save();

      return subscriber;
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Failed to unsubscribe: ${error.message}`, 500);
    }
  }

  // Update preferences
  async updatePreferences(preferencesData: NewsletterPreferencesInput) {
    try {
      const subscriber = await Newsletter.findOne({
        email: preferencesData.email,
        isActive: true,
      });

      if (!subscriber) {
        throw new AppError("Active subscriber not found", 404);
      }

      subscriber.preferences = preferencesData.preferences;
      await subscriber.save();

      return subscriber;
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Failed to update preferences: ${error.message}`, 500);
    }
  }

  // Get subscriber by email
  async getSubscriber(email: string) {
    try {
      const subscriber = await Newsletter.findOne({
        email: email.toLowerCase(),
      })
        .select("-verificationToken -unsubscribeToken")
        .lean();

      return subscriber;
    } catch (error: any) {
      throw new AppError(`Failed to fetch subscriber: ${error.message}`, 500);
    }
  }

  // Get subscribers with pagination (Admin)
  async getSubscribersWithPagination({
    page = 1,
    limit = 20,
    isActive,
    isVerified,
    source,
  }: {
    page?: number;
    limit?: number;
    isActive?: boolean;
    isVerified?: boolean;
    source?: string;
  }) {
    try {
      const filter: any = {};

      if (typeof isActive === "boolean") filter.isActive = isActive;
      if (typeof isVerified === "boolean") filter.isVerified = isVerified;
      if (source) filter.source = source;

      const skip = (page - 1) * limit;

      const [subscribers, totalCount] = await Promise.all([
        Newsletter.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .select("-verificationToken -unsubscribeToken")
          .lean(),
        Newsletter.countDocuments(filter),
      ]);

      return {
        subscribers,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      };
    } catch (error: any) {
      throw new AppError(`Failed to fetch subscribers: ${error.message}`, 500);
    }
  }

  // Get newsletter statistics
  async getNewsletterStats() {
    try {
      const [totalStats, sourceStats, preferenceStats, recentStats] =
        await Promise.all([
          Newsletter.aggregate([
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                active: { $sum: { $cond: ["$isActive", 1, 0] } },
                verified: { $sum: { $cond: ["$isVerified", 1, 0] } },
                unsubscribed: {
                  $sum: { $cond: [{ $not: "$isActive" }, 1, 0] },
                },
              },
            },
          ]),
          Newsletter.aggregate([
            {
              $group: {
                _id: "$source",
                count: { $sum: 1 },
              },
            },
          ]),
          Newsletter.aggregate([
            { $unwind: "$preferences" },
            {
              $group: {
                _id: "$preferences",
                count: { $sum: 1 },
              },
            },
          ]),
          Newsletter.aggregate([
            {
              $match: {
                createdAt: {
                  $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
                },
              },
            },
            {
              $group: {
                _id: {
                  $dateToString: {
                    format: "%Y-%m-%d",
                    date: "$createdAt",
                  },
                },
                count: { $sum: 1 },
              },
            },
            { $sort: { _id: 1 } },
          ]),
        ]);

      return {
        overview: totalStats[0] || {
          total: 0,
          active: 0,
          verified: 0,
          unsubscribed: 0,
        },
        sourceBreakdown: sourceStats,
        preferenceBreakdown: preferenceStats,
        recentTrend: recentStats,
      };
    } catch (error: any) {
      throw new AppError(
        `Failed to fetch newsletter stats: ${error.message}`,
        500
      );
    }
  }

  // Search subscribers (Admin)
  async searchSubscribers(query: string) {
    try {
      const searchRegex = new RegExp(query, "i");

      const subscribers = await Newsletter.find({
        email: searchRegex,
      })
        .sort({ createdAt: -1 })
        .limit(50)
        .select("-verificationToken -unsubscribeToken")
        .lean();

      return subscribers;
    } catch (error: any) {
      throw new AppError(`Failed to search subscribers: ${error.message}`, 500);
    }
  }

  // Private methods for email notifications
  private async sendVerificationEmail(subscriber: any) {
    try {
      console.log(`📧 Sending verification email to: ${subscriber.email}`);
      console.log(
        `🔗 Verification link: /api/v1/footer/newsletter/verify/${subscriber.verificationToken}`
      );

      // TODO: Implement actual email service
      // await emailService.sendVerificationEmail(subscriber);
    } catch (error) {
      console.error("❌ Failed to send verification email:", error);
    }
  }

  private async sendWelcomeEmail(subscriber: any) {
    try {
      console.log(`🎉 Sending welcome email to: ${subscriber.email}`);

      // TODO: Implement actual email service
      // await emailService.sendWelcomeEmail(subscriber);
    } catch (error) {
      console.error("❌ Failed to send welcome email:", error);
    }
  }
}
