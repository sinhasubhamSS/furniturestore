import express from "express";
import { SupportController } from "../../controllers/footer/supportController";
import { authVerify } from "../../middlewares/authVerify";

const router = express.Router();
const supportController = new SupportController();

// Enhanced by [Your Name] - PUBLIC ROUTES (No authentication)
router.post("/create", supportController.createTicket); // Works for both anonymous and logged-in
router.get("/ticket/:ticketNumber", supportController.getTicket);
router.get("/customer-tickets", supportController.getCustomerTickets);

// Enhanced by [Your Name] - USER PROTECTED ROUTES (Login required)
router.get("/my-tickets", authVerify, supportController.getCustomerTickets);
router.post(
  "/ticket/:ticketNumber/reply",
  authVerify,
  supportController.addTicketReply
);

// Enhanced by [Your Name] - ADMIN ROUTES (Login + Admin role required)
// Add role check middleware if you have one, otherwise just authVerify
router.get(
  "/admin/tickets",
  authVerify,
  supportController.getTicketsWithPagination
);
router.get("/admin/search", authVerify, supportController.searchTickets);
router.get("/admin/stats", authVerify, supportController.getSupportStats);
router.put(
  "/admin/ticket/:ticketNumber/status",
  authVerify,
  supportController.updateTicketStatus
);
router.post(
  "/admin/ticket/:ticketNumber/reply",
  authVerify,
  supportController.addTicketReply
);

export default router;
