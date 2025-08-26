// src/controllers/delivery.controller.ts - ✅ UPDATED WITH UTILITY
import { Request, Response, NextFunction } from "express";
import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../utils/AppError";
import { HybridDeliveryService } from "../services/hybrid-deliveryService";
import { DeliveryResult } from "../types/deliverytypes";
import { DeliveryCalculator } from "../utils/DeliveryCalculator/DeliveryCalculator";

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
   * ✅ CORE: Calculate delivery cost with weight - UPDATED WITH UTILITY
   * POST /api/delivery/calculate
   */
  static calculateDeliveryCost = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { pincode, weight, orderValue } = req.body;

      if (!pincode || !weight) {
        return next(new AppError("Pincode and weight are required", 400));
      }

      const deliveryInfo = await HybridDeliveryService.checkDeliverability(
        pincode
      );

      // Early return if not serviceable
      if (!deliveryInfo.isServiceable) {
        return res.status(200).json({
          success: false,
          data: deliveryInfo,
        });
      }

      // ✅ USE SHARED UTILITY - No more duplicate logic
      const charges = DeliveryCalculator.calculateCharges(
        deliveryInfo,
        weight,
        orderValue || 0
      );

      res.status(200).json({
        success: true,
        data: {
          ...deliveryInfo,
          weight: weight,
          orderValue: orderValue || 0,
          ...charges, // Spread calculated charges
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
