import { Request, Response } from "express";
import { z } from "zod";
import { SupportService } from "../../services/footer/supportService";
import { supportTicketSchema } from "../../validations/footer/supportTicket.validation";
import { AppError } from "../../utils/AppError";
import { ApiResponse } from "../../utils/ApiResponse";
import { catchAsync } from "../../utils/catchAsync";

const supportService = new SupportService();

export class SupportController {
  // Create support ticket
  createTicket = catchAsync(
    async (req: Request, res: Response): Promise<void> => {
      // Validate input
      const validatedData = supportTicketSchema.parse(req.body);

      // Call service
      const result = await supportService.createTicket(validatedData);

      res.status(201).json(
        new ApiResponse(
          201,
          {
            ticketNumber: result.ticketNumber,
            ticket: result.ticket,
          },
          "Support ticket created successfully"
        )
      );
    }
  );

  // Get ticket by number
  getTicket = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const { ticketNumber } = req.params;

    if (!ticketNumber) {
      throw new AppError("Ticket number is required", 400);
    }

    const ticket = await supportService.getTicketByNumber(ticketNumber);

    if (!ticket) {
      throw new AppError("Ticket not found", 404);
    }

    res
      .status(200)
      .json(new ApiResponse(200, { ticket }, "Ticket fetched successfully"));
  });

  // Get tickets by email
  getCustomerTickets = catchAsync(
    async (req: Request, res: Response): Promise<void> => {
      const { email } = req.query;

      if (!email || typeof email !== "string") {
        throw new AppError("Email is required", 400);
      }

      const tickets = await supportService.getTicketsByEmail(email);

      res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { tickets },
            "Customer tickets fetched successfully"
          )
        );
    }
  );

  // Update ticket status (Admin only)
  updateTicketStatus = catchAsync(
    async (req: Request, res: Response): Promise<void> => {
      const { ticketNumber } = req.params;
      const { status, assignedTo } = req.body;

      if (!ticketNumber) {
        throw new AppError("Ticket number is required", 400);
      }

      if (!status) {
        throw new AppError("Status is required", 400);
      }

      // Validate status values
      const validStatuses = ["open", "in_progress", "resolved", "closed"];
      if (!validStatuses.includes(status)) {
        throw new AppError("Invalid status value", 400);
      }

      const ticket = await supportService.updateTicketStatus(
        ticketNumber,
        status,
        assignedTo
      );

      res
        .status(200)
        .json(
          new ApiResponse(200, { ticket }, "Ticket status updated successfully")
        );
    }
  );

  // Get support stats (Admin dashboard)
  getSupportStats = catchAsync(
    async (req: Request, res: Response): Promise<void> => {
      const stats = await supportService.getTicketsStats();

      res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { stats },
            "Support statistics fetched successfully"
          )
        );
    }
  );

  // Get tickets with pagination (Admin)
  getTicketsWithPagination = catchAsync(
    async (req: Request, res: Response): Promise<void> => {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as string;
      const category = req.query.category as string;

      const result = await supportService.getTicketsWithPagination({
        page,
        limit,
        status,
        category,
      });

      res.status(200).json(
        new ApiResponse(
          200,
          {
            tickets: result.tickets,
            pagination: {
              currentPage: page,
              totalPages: result.totalPages,
              totalTickets: result.totalCount,
              hasNext: page < result.totalPages,
              hasPrev: page > 1,
            },
          },
          "Tickets fetched successfully"
        )
      );
    }
  );

  // Search tickets (Admin)
  searchTickets = catchAsync(
    async (req: Request, res: Response): Promise<void> => {
      const { query } = req.query;

      if (!query || typeof query !== "string") {
        throw new AppError("Search query is required", 400);
      }

      const tickets = await supportService.searchTickets(query as string);

      res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { tickets },
            "Search results fetched successfully"
          )
        );
    }
  );

  // Add reply to ticket (Admin)
  addTicketReply = catchAsync(
    async (req: Request, res: Response): Promise<void> => {
      const { ticketNumber } = req.params;
      const { message, isAdmin = true } = req.body;

      if (!ticketNumber) {
        throw new AppError("Ticket number is required", 400);
      }

      if (!message) {
        throw new AppError("Reply message is required", 400);
      }

      const result = await supportService.addTicketReply(ticketNumber, {
        message,
        isAdmin,
        timestamp: new Date(),
      });

      res
        .status(201)
        .json(
          new ApiResponse(201, { ticket: result }, "Reply added successfully")
        );
    }
  );
}
