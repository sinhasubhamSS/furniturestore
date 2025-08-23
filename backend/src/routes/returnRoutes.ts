import express from "express";
import { ReturnController } from "../controllers/returnController";
import { authVerify } from "../middlewares/authVerify";
import { isAdmin } from "../middlewares/isAdmin";

const router = express.Router();
const returnController = new ReturnController();

// ✅ User Routes (Authentication Required)
router.post("/", authVerify, returnController.createReturnRequest);
router.get("/user/:userId", authVerify, returnController.getUserReturns);
router.get(
  "/eligibility/:orderId",
  authVerify,
  returnController.checkReturnEligibility
);
router.get("/:returnId", authVerify, returnController.getReturnById);
router.delete("/:returnId", authVerify, returnController.cancelReturnRequest);

// ✅ Admin Routes (Admin Authentication Required)
router.put("/:returnId", isAdmin, returnController.updateReturnStatus);
router.get("/admin/all", isAdmin, returnController.getAllReturns);
router.get("/admin/analytics", isAdmin, returnController.getReturnAnalytics);

export default router;
