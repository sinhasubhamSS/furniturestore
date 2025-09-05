import express from "express";
import { ReturnController } from "../controllers/returnController";
import { authVerify } from "../middlewares/authVerify";
import { isAdmin } from "../middlewares/isAdmin";

const router = express.Router();
const returnController = new ReturnController();

// ✅ User Routes (Authentication Required)
router.post("/", authVerify, returnController.createReturnRequest);

// ✅ FIX: Remove userId from URL - get from req.userId instead
router.get("/my-returns", authVerify, returnController.getUserReturns);

router.get(
  "/eligibility/:orderId",
  authVerify,
  returnController.checkReturnEligibility
);
router.get("/:returnId", authVerify, returnController.getReturnById);
router.delete("/:returnId", authVerify, returnController.cancelReturnRequest);

// ✅ Admin Routes (Admin Authentication Required)
router.put("/:returnId/status", authVerify,isAdmin, returnController.updateReturnStatus);
router.get("/admin/all",authVerify, isAdmin, returnController.getAllReturns);
router.get("/admin/analytics", authVerify,isAdmin, returnController.getReturnAnalytics);

// ✅ NEW: Admin helper route for status transitions
router.get(
  "/:returnId/next-statuses",
  isAdmin,
  returnController.getNextAllowedStatuses
);
router.get("/admin/all", authVerify, isAdmin, returnController.getAllReturnsAdmin);
export default router;
