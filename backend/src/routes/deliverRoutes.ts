// src/routes/delivery.routes.ts
import { Router } from "express";
import { DeliveryController } from "../controllers/hybrid-deliveryController";

const router = Router();

// ========================================
// 👤 USER ROUTES - Customer features
// ========================================
router.post("/check", DeliveryController.checkDelivery);
router.post("/calculate", DeliveryController.calculateDeliveryCost);
router.get("/zones", DeliveryController.getServiceableZones);

// ========================================
// 🔐 ADMIN ROUTES - Simple management
// ========================================
router.get("/admin/zones", DeliveryController.getAllZones);
router.patch("/admin/zones/:pincode/toggle", DeliveryController.toggleZone);

export default router;
