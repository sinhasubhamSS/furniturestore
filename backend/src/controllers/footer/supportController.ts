import { Request, Response } from "express";
import { z } from "zod";
import { SupportService } from "../../services/footer/supportService";
import { supportTicketSchema } from "../../validations/footer/supportTicket.validation";
import { AppError } from "../../utils/AppError";
import { ApiResponse } from "../../utils/ApiResponse";
import { catchAsync } from "../../utils/catchAsync";
import { AuthRequest } from "../../types/app-request";

const supportService = new SupportService();

export class SupportController {
  createTicket = catchAsync(
    async (req: AuthRequest, res: Response): Promise<void> => {
      try {
        const validatedData = supportTicketSchema.parse(req.body);
        const user = req.user;
        const result = await supportService.createTicket(validatedData, user);
        
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
      } catch (error) {
        if (error instanceof z.ZodError) {
          const formattedErrors = error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message
          }));
          
          throw new AppError(
            `Validation failed: ${formattedErrors.map(e => `${e.field}: ${e.message}`).join(', ')}`, 
            400
          );
        }
        throw error;
      }
    }
  );

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
            { tickets, count: tickets.length },
            "Customer tickets fetched successfully"
          )
        );
    }
  );

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
      
      const validStatuses = ["open", "in_progress", "resolved", "closed"];
      if (!validStatuses.includes(status)) {
        throw new AppError("Invalid status value", 400);
      }
      
      try {
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
      } catch (error: any) {
        if (error.message === "Ticket not found") {
          throw new AppError("Ticket not found", 404);
        }
        throw new AppError(`Failed to update ticket: ${error.message}`, 500);
      }
    }
  );

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
            { tickets, count: tickets.length },
            "Search results fetched successfully"
          )
        );
    }
  );

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
      
      try {
        const ticket = await supportService.addTicketReply(ticketNumber, {
          message,
          isAdmin,
          timestamp: new Date(),
        });
        
        res
          .status(201)
          .json(
            new ApiResponse(201, { ticket }, "Reply added successfully")
          );
      } catch (error: any) {
        if (error.message === "Ticket not found") {
          throw new AppError("Ticket not found", 404);
        }
        throw new AppError(`Failed to add reply: ${error.message}`, 500);
      }
    }
  );
}
