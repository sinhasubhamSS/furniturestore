import { SupportTicket } from "../../models/footer/SupportTicket.models";
import { SupportTicketInput } from "../../validations/footer/supportTicket.validation";
import { emailService } from "../../utils/emailServices";

export class SupportService {
  // Priority logic and ticket creation
  async createTicket(ticketData: SupportTicketInput, user?: any) {
    let priority: "low" | "medium" | "high" | "urgent" = "medium";

    if (["order_issue", "delivery"].includes(ticketData.category)) {
      priority = "high";
    } else if (ticketData.category === "return_refund") {
      priority = "urgent";
    }

    // Merge user info if available
    const enhancedTicketData = {
      ...ticketData,
      priority,
      customerEmail: user?.email || ticketData.customerEmail,
      customerName: user?.name || ticketData.customerName,
      userId: user?.id || null,
    };

    const ticket = new SupportTicket(enhancedTicketData);
    await ticket.save();

    // Send notifications asynchronously (non-blocking)
    // this.sendTicketNotifications(ticket, user).catch(console.error);

    return {
      ticket,
      ticketNumber: ticket.ticketNumber,
    };
  }

  async getTicketByNumber(ticketNumber: string) {
    return await SupportTicket.findOne({ ticketNumber })
      .populate("productId", "name price category")
      .populate("userId", "name email")
      .select("-__v")
      .lean();
  }

  async getTicketsByEmail(email: string) {
    return await SupportTicket.find({
      customerEmail: email.toLowerCase(),
    })
      .sort({ createdAt: -1 })
      .populate("productId", "name price")
      .select("-__v")
      .lean();
  }

  async getTicketsWithPagination({
    page = 1,
    limit = 10,
    status,
    category,
  }: {
    page?: number;
    limit?: number;
    status?: string;
    category?: string;
  }) {
    const filter: any = {};
    if (status) filter.status = status;
    if (category) filter.category = category;

    const skip = (page - 1) * limit;

    const [tickets, totalCount] = await Promise.all([
      SupportTicket.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("productId", "name price")
        .populate("userId", "name email")
        .select("-__v")
        .lean(),
      SupportTicket.countDocuments(filter),
    ]);

    return {
      tickets,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
    };
  }

  async searchTickets(query: string) {
    const searchRegex = new RegExp(query, "i");
    return await SupportTicket.find({
      $or: [
        { ticketNumber: searchRegex },
        { customerName: searchRegex },
        { customerEmail: searchRegex },
        { subject: searchRegex },
        { description: searchRegex }, // Fixed: changed from message
        { orderId: searchRegex },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("productId", "name price")
      .select("-__v")
      .lean();
  }

  async addTicketReply(
    ticketNumber: string,
    reply: {
      message: string;
      isAdmin: boolean;
      timestamp: Date;
    }
  ) {
    const ticket = await SupportTicket.findOneAndUpdate(
      { ticketNumber },
      {
        $push: {
          replies: reply,
        },
        $set: {
          status: reply.isAdmin ? "in_progress" : "open",
          updatedAt: new Date(),
        },
      },
      { new: true }
    )
      .populate("productId", "name price")
      .lean();

    if (!ticket) {
      throw new Error("Ticket not found");
    }
    return ticket;
  }

  async updateTicketStatus(
    ticketNumber: string,
    status: string,
    assignedTo?: string
  ) {
    const updateData: any = { status };

    if (status === "resolved" || status === "closed") {
      updateData.resolvedAt = new Date();
    }
    if (assignedTo) {
      updateData.assignedTo = assignedTo;
    }

    const ticket = await SupportTicket.findOneAndUpdate(
      { ticketNumber },
      updateData,
      { new: true }
    )
      .populate("productId", "name price")
      .populate("userId", "name email")
      .lean();

    if (!ticket) {
      throw new Error("Ticket not found");
    }
    return ticket;
  }

  async getTicketsStats() {
    const [statusStats, categoryStats, priorityStats, recentStats] =
      await Promise.all([
        SupportTicket.aggregate([
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 },
            },
          },
        ]),
        SupportTicket.aggregate([
          {
            $group: {
              _id: "$category",
              count: { $sum: 1 },
            },
          },
        ]),
        SupportTicket.aggregate([
          {
            $group: {
              _id: "$priority",
              count: { $sum: 1 },
            },
          },
        ]),
        SupportTicket.aggregate([
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
      statusStats,
      categoryStats,
      priorityStats,
      recentTrend: recentStats,
    };
  }

  // Email notification methods
  // private async sendTicketNotifications(ticket: any, user?: any) {
  //   try {
  //     console.log(
  //       `📧 Sending notifications for ticket: ${ticket.ticketNumber}`
  //     );

  //     await this.notifyAdminTeam(ticket, user);
  //     await this.sendCustomerConfirmation(ticket);

  //     console.log(
  //       `✅ All notifications sent successfully for: ${ticket.ticketNumber}`
  //     );
  //   } catch (error) {
  //     console.error("❌ Failed to send notifications:", error);
  //     // Don't throw error as ticket creation should succeed
  //   }
  // }

  // private async notifyAdminTeam(ticket: any, user?: any) {
  //   const html = `
  //     <!DOCTYPE html>
  //     <html>
  //     <body style="font-family: Arial, sans-serif;">
  //       <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
  //         <h2 style="color: #dc2626;">🚨 New Support Ticket Alert</h2>
          
  //         <div style="background: #fee2e2; padding: 15px; border-radius: 6px; margin: 15px 0;">
  //           <h3 style="margin-top: 0;">Customer Information</h3>
  //           <p><strong>Name:</strong> ${ticket.customerName}</p>
  //           <p><strong>Email:</strong> ${ticket.customerEmail}</p>
  //           <p><strong>Phone:</strong> ${
  //             ticket.customerPhone || "Not provided"
  //           }</p>
  //           ${
  //             user
  //               ? `<p><strong>User Type:</strong> Registered User (ID: ${user.id})</p>`
  //               : "<p><strong>User Type:</strong> Anonymous User</p>"
  //           }
  //         </div>
          
  //         <div style="background: #eff6ff; padding: 15px; border-radius: 6px; margin: 15px 0;">
  //           <h3 style="margin-top: 0;">Ticket Information</h3>
  //           <p><strong>Ticket Number:</strong> ${ticket.ticketNumber}</p>
  //           <p><strong>Subject:</strong> ${ticket.subject}</p>
  //           <p><strong>Category:</strong> ${ticket.category}</p>
  //           <p><strong>Priority:</strong> <span style="color: ${
  //             ticket.priority === "urgent" ? "#dc2626" : "#2563eb"
  //           }">${ticket.priority.toUpperCase()}</span></p>
  //           ${
  //             ticket.orderId
  //               ? `<p><strong>Order ID:</strong> ${ticket.orderId}</p>`
  //               : ""
  //           }
  //         </div>
          
  //         <div style="background: #f9fafb; padding: 15px; border-radius: 6px;">
  //           <h3 style="margin-top: 0;">Issue Description</h3>
  //           <p>${ticket.description}</p>
  //         </div>
          
  //         <div style="background: #fef3c7; padding: 10px; border-radius: 4px; margin-top: 20px;">
  //           <p style="margin: 0;"><strong>⏰ Please respond promptly to maintain our support SLA.</strong></p>
  //         </div>
  //       </div>
  //     </body>
  //     </html>
  //   `;

  //   return await emailService.sendEmail({
  //     from: ticket.customerEmail,
  //     to: process.env.SUPPORT_EMAIL || "support@yourdomain.com",
  //     subject: `🚨 New Support Ticket: ${
  //       ticket.ticketNumber
  //     } [${ticket.priority.toUpperCase()}]`,
  //     html,
  //     text: `New Support Ticket: ${ticket.ticketNumber}\nFrom: ${ticket.customerName} (${ticket.customerEmail})\nSubject: ${ticket.subject}\nDescription: ${ticket.description}`,
  //   });
  // }

  // private async sendCustomerConfirmation(ticket: any) {
  //   const html = `
  //     <!DOCTYPE html>
  //     <html>
  //     <body style="font-family: Arial, sans-serif;">
  //       <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
  //         <h2 style="color: #2563eb;">Support Ticket Confirmation ✅</h2>
          
  //         <p>Dear ${ticket.customerName},</p>
          
  //         <p>Thank you for contacting our support team. We have successfully received your ticket and our team will respond shortly.</p>
          
  //         <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
  //           <h3 style="margin-top: 0; color: #1e40af;">Your Ticket Details</h3>
  //           <p><strong>Ticket Number:</strong> ${ticket.ticketNumber}</p>
  //           <p><strong>Subject:</strong> ${ticket.subject}</p>
  //           <p><strong>Category:</strong> ${ticket.category}</p>
  //           <p><strong>Priority:</strong> <span style="color: ${
  //             ticket.priority === "urgent" ? "#dc2626" : "#059669"
  //           }">${ticket.priority.toUpperCase()}</span></p>
  //           <p><strong>Status:</strong> ${ticket.status}</p>
  //         </div>
          
  //         <div style="background: #ecfdf5; padding: 15px; border-radius: 6px; border-left: 4px solid #10b981;">
  //           <p style="margin: 0;"><strong>📞 What happens next?</strong></p>
  //           <p style="margin: 5px 0 0 0;">Our support team will review your ticket and respond within 24 hours. You can track your ticket status using the ticket number: <strong>${
  //             ticket.ticketNumber
  //           }</strong></p>
  //         </div>
          
  //         <p style="margin-top: 30px;">Best regards,<br><strong>Customer Support Team</strong></p>
          
  //         <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
  //         <p style="font-size: 12px; color: #6b7280;">
  //           This is an automated message. Please save this email for your records. If you need to add more information to this ticket, please reply to this email with your ticket number.
  //         </p>
  //       </div>
  //     </body>
  //     </html>
  //   `;

  //   return await emailService.sendEmail({
  //     from: process.env.SUPPORT_EMAIL || "support@yourdomain.com",
  //     to: ticket.customerEmail,
  //     subject: `Support Ticket Created Successfully: ${ticket.ticketNumber}`,
  //     html,
  //     text: `Dear ${ticket.customerName},\n\nYour support ticket has been created successfully.\n\nTicket Number: ${ticket.ticketNumber}\nSubject: ${ticket.subject}\nCategory: ${ticket.category}\nPriority: ${ticket.priority}\n\nWe will respond within 24 hours.\n\nBest regards,\nCustomer Support Team`,
  //   });
  // }
}
