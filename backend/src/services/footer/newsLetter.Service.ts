import { AppError } from "../../utils/AppError";
import crypto from "crypto";
import {
  NewsletterPreferencesInput,
  NewsletterSubscribeInput,
  NewsletterUnsubscribeInput,
} from "../../validations/footer/newsLetter.validation";
import { Newsletter } from "../../models/footer/newsLetter.models";
import { emailService } from "../../utils/emailServices";

export class NewsletterService {
  // Subscribe to newsletter - NO try/catch
  async subscribe(subscribeData: NewsletterSubscribeInput) {
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

    // Create new subscriber with verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const subscriber = new Newsletter({
      ...subscribeData,
      isVerified: false,
      verificationToken,
    });

    await subscriber.save();

    // Send verification email
    this.sendVerificationEmail(subscriber).catch(console.error);

    return {
      subscriber,
      isReactivated: false,
    };
  }

  // Verify email subscription - NO try/catch
  async verifyEmail(token: string) {
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
  }

  // Unsubscribe from newsletter - NO try/catch
  async unsubscribe(unsubscribeData: NewsletterUnsubscribeInput) {
    const query: any = { email: unsubscribeData.email };

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

    // Send unsubscribe confirmation
    this.sendUnsubscribeConfirmation(subscriber).catch(console.error);

    return subscriber;
  }

  // Update preferences - NO try/catch
  async updatePreferences(preferencesData: NewsletterPreferencesInput) {
    const subscriber = await Newsletter.findOne({
      email: preferencesData.email,
      isActive: true,
    });

    if (!subscriber) {
      throw new AppError("Active subscriber not found", 404);
    }

    subscriber.preferences = preferencesData.preferences;
    await subscriber.save();

    // Send preferences update confirmation
    this.sendPreferencesUpdateEmail(subscriber).catch(console.error);

    return subscriber;
  }

  // Get subscriber by email - NO try/catch
  async getSubscriber(email: string) {
    return await Newsletter.findOne({
      email: email.toLowerCase(),
    })
      .select("-verificationToken -unsubscribeToken")
      .lean();
  }

  // Get subscribers with pagination (Admin) - NO try/catch
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
  }

  // Get newsletter statistics - NO try/catch
  async getNewsletterStats() {
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
                $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
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
  }

  // Search subscribers (Admin) - NO try/catch
  async searchSubscribers(query: string) {
    const searchRegex = new RegExp(query, "i");

    return await Newsletter.find({
      email: searchRegex,
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .select("-verificationToken -unsubscribeToken")
      .lean();
  }

  // Send newsletter to all active subscribers (Admin) - NO try/catch
  async sendNewsletter(subject: string, content: string, htmlContent?: string) {
    const activeSubscribers = await Newsletter.find({
      isActive: true,
      isVerified: true,
    })
      .select("email preferences")
      .lean();

    const emailPromises = activeSubscribers.map((subscriber) =>
      this.sendNewsletterEmail(subscriber, subject, content, htmlContent).catch(
        (error) => {
          console.error(
            `Failed to send newsletter to ${subscriber.email}:`,
            error
          );
        }
      )
    );

    const results = await Promise.allSettled(emailPromises);
    const successful = results.filter(
      (result) => result.status === "fulfilled"
    ).length;
    const failed = results.filter(
      (result) => result.status === "rejected"
    ).length;

    return {
      total: activeSubscribers.length,
      successful,
      failed,
    };
  }

  // Private methods for email notifications
  // In newsletter service - sendVerificationEmail method
  private async sendVerificationEmail(subscriber: any) {
    console.log(`📧 Sending verification email to: ${subscriber.email}`);

    const verificationUrl = `${process.env.FRONTEND_URL}/newsletter/verify/${subscriber.verificationToken}`;

    const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="padding: 20px;">
        <h2 style="color: #2563eb;">📧 Verify Your Newsletter Subscription</h2>
        
        <p>Hi there!</p>
        
        <p>Thank you for subscribing to our newsletter. Please click the button below to verify your email address:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        
        <p>Or copy and paste this link in your browser:</p>
        <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
        
        <p>If you didn't subscribe to our newsletter, please ignore this email.</p>
        
        <p>Best regards,<br>Your Newsletter Team</p>
      </div>
    </body>
    </html>
  `;

    try {
      await emailService.sendEmail({
        from: "onboarding@resend.dev",
        to: subscriber.email, // ✅ Send to actual subscriber email
        subject: "Please verify your newsletter subscription",
        html,
        text: `Please verify your newsletter subscription by visiting: ${verificationUrl}`,
      });

      console.log(`✅ Verification email sent to: ${subscriber.email}`);
    } catch (error) {
      console.error("❌ Failed to send verification email:", error);
    }
  }

  private async sendWelcomeEmail(subscriber: any) {
    console.log(`🎉 Sending welcome email to: ${subscriber.email}`);

    const html = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="padding: 20px;">
          <h2 style="color: #059669;">🎉 Welcome to Our Newsletter!</h2>
          
          <p>Hi there!</p>
          
          <p>Welcome to our newsletter! We're thrilled to have you on board.</p>
          
          <div style="background: #f0f9ff; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Your Preferences:</h3>
            <ul>
              ${subscriber.preferences
                .map(
                  (pref: string) =>
                    `<li>${pref.replace("_", " ").toUpperCase()}</li>`
                )
                .join("")}
            </ul>
          </div>
          
          <p>You'll receive updates about:</p>
          <ul>
            <li>Special offers and discounts</li>
            <li>New product launches</li>
            <li>Company updates</li>
            <li>Industry insights</li>
          </ul>
          
          <p>You can update your preferences or unsubscribe at any time.</p>
          
          <p>Best regards,<br>Your Newsletter Team</p>
        </div>
      </body>
      </html>
    `;

    try {
      await emailService.sendEmail({
        from: "onboarding@resend.dev",
        to:
          process.env.NODE_ENV === "production"
            ? subscriber.email
            : "subhamsinhass.344@gmail.com",
        subject: "🎉 Welcome to Our Newsletter!",
        html,
        text: `Welcome to our newsletter! Your preferences: ${subscriber.preferences.join(
          ", "
        )}`,
      });

      console.log(`✅ Welcome email sent to: ${subscriber.email}`);
    } catch (error) {
      console.error("❌ Failed to send welcome email:", error);
    }
  }

  private async sendUnsubscribeConfirmation(subscriber: any) {
    console.log(`📧 Sending unsubscribe confirmation to: ${subscriber.email}`);

    const html = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="padding: 20px;">
          <h2 style="color: #dc2626;">📭 Unsubscribed Successfully</h2>
          
          <p>Hi there!</p>
          
          <p>You have been successfully unsubscribed from our newsletter.</p>
          
          <p>We're sorry to see you go! If you change your mind, you can always subscribe again.</p>
          
          <p>If this was a mistake, you can resubscribe anytime.</p>
          
          <p>Best regards,<br>Your Newsletter Team</p>
        </div>
      </body>
      </html>
    `;

    try {
      await emailService.sendEmail({
        from: "onboarding@resend.dev",
        to:
          process.env.NODE_ENV === "production"
            ? subscriber.email
            : "subhamsinhass.344@gmail.com",
        subject: "Unsubscribed from Newsletter",
        html,
        text: "You have been successfully unsubscribed from our newsletter.",
      });

      console.log(`✅ Unsubscribe confirmation sent to: ${subscriber.email}`);
    } catch (error) {
      console.error("❌ Failed to send unsubscribe confirmation:", error);
    }
  }

  private async sendPreferencesUpdateEmail(subscriber: any) {
    console.log(`📧 Sending preferences update email to: ${subscriber.email}`);

    const html = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="padding: 20px;">
          <h2 style="color: #2563eb;">⚙️ Newsletter Preferences Updated</h2>
          
          <p>Hi there!</p>
          
          <p>Your newsletter preferences have been successfully updated.</p>
          
          <div style="background: #f0f9ff; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Your Current Preferences:</h3>
            <ul>
              ${subscriber.preferences
                .map(
                  (pref: string) =>
                    `<li>${pref.replace("_", " ").toUpperCase()}</li>`
                )
                .join("")}
            </ul>
          </div>
          
          <p>You can update these preferences anytime.</p>
          
          <p>Best regards,<br>Your Newsletter Team</p>
        </div>
      </body>
      </html>
    `;

    try {
      await emailService.sendEmail({
        from: "onboarding@resend.dev",
        to:
          process.env.NODE_ENV === "production"
            ? subscriber.email
            : "subhamsinhass.344@gmail.com",
        subject: "Newsletter Preferences Updated",
        html,
        text: `Your newsletter preferences have been updated: ${subscriber.preferences.join(
          ", "
        )}`,
      });

      console.log(`✅ Preferences update email sent to: ${subscriber.email}`);
    } catch (error) {
      console.error("❌ Failed to send preferences update email:", error);
    }
  }

  private async sendNewsletterEmail(
    subscriber: any,
    subject: string,
    content: string,
    htmlContent?: string
  ) {
    const unsubscribeUrl = `${process.env.FRONTEND_URL}/newsletter/unsubscribe?email=${subscriber.email}`;

    const html =
      htmlContent ||
      `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="padding: 20px;">
          <h2 style="color: #2563eb;">${subject}</h2>
          <div style="line-height: 1.6;">
            ${content.replace(/\n/g, "<br>")}
          </div>
          <hr style="margin: 30px 0;">
          <p style="font-size: 12px; color: #666;">
            <a href="${unsubscribeUrl}">Unsubscribe</a> from these emails
          </p>
        </div>
      </body>
      </html>
    `;

    return await emailService.sendEmail({
      from: "onboarding@resend.dev",
      to:
        process.env.NODE_ENV === "production"
          ? subscriber.email
          : "subhamsinhass.344@gmail.com",
      subject,
      html,
      text: content,
    });
  }
}
