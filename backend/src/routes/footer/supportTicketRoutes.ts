import express from "express";
import { SupportController } from "../../controllers/footer/supportController";
// Import your existing auth middleware when needed
// import { protect, restrictTo } from '../../middleware/auth';

const router = express.Router();
const supportController = new SupportController();

// ✅ Public Routes (No Authentication Required)
router.post("/create", supportController.createTicket);
router.get("/ticket/:ticketNumber", supportController.getTicket);
router.get("/customer-tickets", supportController.getCustomerTickets);

// ✅ Admin Routes (Authentication Required - Add middleware later)
// Uncomment these when you add authentication middleware
// router.use(protect); // Add your auth middleware
// router.use(restrictTo('admin', 'support')); // Add role-based access

router.get("/admin/tickets", supportController.getTicketsWithPagination);
router.get("/admin/search", supportController.searchTickets);
router.get("/admin/stats", supportController.getSupportStats);
router.put(
  "/admin/ticket/:ticketNumber/status",
  supportController.updateTicketStatus
);
router.post(
  "/admin/ticket/:ticketNumber/reply",
  supportController.addTicketReply
);

export default router;
