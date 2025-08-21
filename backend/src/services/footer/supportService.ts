import { SupportTicket } from "../../models/footer/SupportTicket";
import { SupportTicketInput } from "../../validations/footer/supportTicket.validation";
import { AppError } from "../../utils/AppError";

export class SupportService {
  // Create support ticket
  async createTicket(ticketData: SupportTicketInput) {
    try {
      // Business logic for priority assignment
      let priority: "low" | "medium" | "high" | "urgent" = "medium";

      if (["order_issue", "delivery"].includes(ticketData.category)) {
        priority = "high";
      } else if (ticketData.category === "return_refund") {
        priority = "urgent";
      }

      // Create ticket
      const ticket = new SupportTicket({
        ...ticketData,
        priority,
      });

      await ticket.save();

      // Send notifications asynchronously (non-blocking)
      this.sendTicketNotifications(ticket).catch(console.error);

      return {
        success: true,
        ticket,
        ticketNumber: ticket.ticketNumber,
      };
    } catch (error: any) {
      throw new AppError(`Failed to create ticket: ${error.message}`, 500);
    }
  }

  // Get ticket by ticket number
  async getTicketByNumber(ticketNumber: string) {
    try {
      const ticket = await SupportTicket.findOne({ ticketNumber })
        .populate("productId", "name price category")
        .select("-__v")
        .lean(); // ✅ Performance: Use lean() for read-only queries

      return ticket;
    } catch (error: any) {
      throw new AppError(`Failed to fetch ticket: ${error.message}`, 500);
    }
  }

  // Get tickets by customer email
  async getTicketsByEmail(email: string) {
    try {
      const tickets = await SupportTicket.find({
        customerEmail: email.toLowerCase(),
      })
        .sort({ createdAt: -1 })
        .select("-__v")
        .lean(); // ✅ Performance: Use lean()

      return tickets;
    } catch (error: any) {
      throw new AppError(`Failed to fetch tickets: ${error.message}`, 500);
    }
  }

  // ✅ MISSING METHOD: Get tickets with pagination
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
    try {
      // Build filter object
      const filter: any = {};
      if (status) filter.status = status;
      if (category) filter.category = category;

      const skip = (page - 1) * limit;

      // ✅ Performance: Use Promise.all for parallel queries
      const [tickets, totalCount] = await Promise.all([
        SupportTicket.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate("productId", "name price")
          .select("-__v")
          .lean(),
        SupportTicket.countDocuments(filter),
      ]);

      return {
        tickets,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      };
    } catch (error: any) {
      throw new AppError(`Failed to fetch tickets: ${error.message}`, 500);
    }
  }

  // ✅ MISSING METHOD: Search tickets
  async searchTickets(query: string) {
    try {
      const searchRegex = new RegExp(query, "i");

      const tickets = await SupportTicket.find({
        $or: [
          { ticketNumber: searchRegex },
          { customerName: searchRegex },
          { customerEmail: searchRegex },
          { subject: searchRegex },
          { orderId: searchRegex },
        ],
      })
        .sort({ createdAt: -1 })
        .limit(50) // ✅ Performance: Limit search results
        .select("-__v")
        .lean();

      return tickets;
    } catch (error: any) {
      throw new AppError(`Failed to search tickets: ${error.message}`, 500);
    }
  }

  // ✅ MISSING METHOD: Add reply to ticket
  async addTicketReply(
    ticketNumber: string,
    reply: {
      message: string;
      isAdmin: boolean;
      timestamp: Date;
    }
  ) {
    try {
      const ticket = await SupportTicket.findOneAndUpdate(
        { ticketNumber },
        {
          $push: {
            replies: reply,
          },
          $set: {
            status: reply.isAdmin ? "in_progress" : "open",
          },
        },
        { new: true }
      ).lean();

      if (!ticket) {
        throw new AppError("Ticket not found", 404);
      }

      return ticket;
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Failed to add reply: ${error.message}`, 500);
    }
  }

  // Update ticket status
  async updateTicketStatus(
    ticketNumber: string,
    status: string,
    assignedTo?: string
  ) {
    try {
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
      ).lean();

      if (!ticket) {
        throw new AppError("Ticket not found", 404);
      }

      return ticket;
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Failed to update ticket: ${error.message}`, 500);
    }
  }

  // Get tickets stats for dashboard
  async getTicketsStats() {
    try {
      // ✅ Performance: Use Promise.all for parallel aggregations
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
          // ✅ Additional: Recent tickets trend
          SupportTicket.aggregate([
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
        statusStats,
        categoryStats,
        priorityStats,
        recentTrend: recentStats,
      };
    } catch (error: any) {
      throw new AppError(`Failed to fetch stats: ${error.message}`, 500);
    }
  }

  // Private method for notifications
  private async sendTicketNotifications(ticket: any) {
    try {
      // ✅ Performance: Non-blocking background task
      console.log(
        `📧 Sending notifications for ticket: ${ticket.ticketNumber}`
      );

      // TODO: Implement actual notification services
      // await emailService.sendTicketConfirmation(ticket);
      // await whatsappService.notifyCustomer(ticket);
      // await slackService.notifySupportTeam(ticket);
    } catch (error) {
      console.error("❌ Failed to send notifications:", error);
      // Don't throw error as ticket creation should succeed
    }
  }
}
