import { Router } from "express";
import { AdminController } from "../controllers/adminController";

const router = Router();

// Admin dashboard stats endpoint
router.get("/dashboard", AdminController.getDashboardStats);

export default router;
