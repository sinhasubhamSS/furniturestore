// src/controllers/delivery.controller.ts
import { Request, Response, NextFunction } from "express";
import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../utils/AppError";
import { HybridDeliveryService } from "../services/hybrid-deliveryService";
import { DeliveryResult } from "../types/deliverytypes";

export class DeliveryController {
  // ========================================
  // 👤 USER ENDPOINTS - Customer core needs
  // ========================================

  /**
   * ✅ CORE: Check pincode delivery
   * POST /api/delivery/check
   */
  static checkDelivery = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { pincode } = req.body;

      if (!pincode) {
        return next(new AppError("Pincode is required", 400));
      }

      const result: DeliveryResult =
        await HybridDeliveryService.checkDeliverability(pincode);

      res.status(200).json({
        success: true,
        data: result,
      });
    }
  );

  /**
   * ✅ CORE: Calculate delivery cost with weight
   * POST /api/delivery/calculate
   */
  static calculateDeliveryCost = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { pincode, weight, orderValue } = req.body;

      if (!pincode || !weight) {
        return next(new AppError("Pincode and weight are required", 400));
      }

      const result = await HybridDeliveryService.checkDeliverability(pincode);

      // Early return if not serviceable
      if (!result.isServiceable) {
        return res.status(200).json({
          success: false,
          data: result,
        });
      }

      // Calculate final charges
      let totalCharge = result.deliveryCharge;

      // Extra weight charges
      if (weight > result.maxWeight) {
        const extraWeight = weight - result.maxWeight;
        totalCharge += Math.ceil(extraWeight) * 20; // ₹20 per extra kg
      }

      // Free delivery discount
      if (orderValue && orderValue >= 100000) {
        totalCharge = Math.max(0, totalCharge - 50); // ₹50 off
      }

      res.status(200).json({
        success: true,
        data: {
          ...result,
          weight: weight,
          orderValue: orderValue || 0,
          originalCharge: result.deliveryCharge,
          finalCharge: totalCharge,
          discount: orderValue >= 100000 ? 50 : 0,
          freeDeliveryEligible: orderValue >= 100000,
        },
      });
    }
  );

  /**
   * ✅ INFO: Show delivery zones to customers
   * GET /api/delivery/zones
   */
  static getServiceableZones = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const zones = await HybridDeliveryService.getServiceableZones();

      res.status(200).json({
        success: true,
        data: {
          totalZones: zones.length,
          zones: zones,
        },
      });
    }
  );

  // ========================================
  // 🔐 ADMIN ENDPOINTS - Simple management
  // ========================================

  /**
   * ✅ ADMIN: View all zones
   * GET /api/admin/delivery/zones
   */
  static getAllZones = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const zones = await HybridDeliveryService.getAllZones();

      res.status(200).json({
        success: true,
        data: {
          total: zones.length,
          zones: zones,
        },
      });
    }
  );

  /**
   * ✅ ADMIN: Enable/disable zone
   * PATCH /api/admin/delivery/zones/:pincode/toggle
   */
  static toggleZone = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { pincode } = req.params;

      const updatedZone = await HybridDeliveryService.toggleZone(pincode);

      res.status(200).json({
        success: true,
        data: updatedZone,
        message: `Zone ${
          updatedZone.isServiceable ? "enabled" : "disabled"
        } successfully`,
      });
    }
  );
}
