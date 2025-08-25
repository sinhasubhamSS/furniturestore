// src/controllers/delivery.controller.ts
import { Request, Response, NextFunction } from "express";
import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../utils/AppError";
import { HybridDeliveryService } from "../services/hybrid-deliveryService";
import { DeliveryZone } from "../models/deliveryzone.models";

export class DeliveryController {
  // ✅ Check single pincode delivery
  static checkDelivery = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { pincode } = req.body;

      // Basic validation
      if (!pincode) {
        return next(new AppError("Pincode is required", 400));
      }

      const result = await HybridDeliveryService.checkDeliverability(pincode);

      res.status(200).json({
        success: true,
        data: result,
      });
    }
  );

  // ✅ Check multiple pincodes delivery
  static checkBulkDelivery = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { pincodes } = req.body;

      if (!pincodes || !Array.isArray(pincodes) || pincodes.length === 0) {
        return next(new AppError("Pincodes array is required", 400));
      }

      if (pincodes.length > 10) {
        return next(
          new AppError("Maximum 10 pincodes allowed per request", 400)
        );
      }

      const results = await HybridDeliveryService.getBulkDeliverability(
        pincodes
      );

      res.status(200).json({
        success: true,
        data: {
          total: results.length,
          serviceable: results.filter((r) => r.isServiceable).length,
          results: results,
        },
      });
    }
  );

  // ✅ Get all serviceable zones info
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

  // ✅ Get delivery charges for specific zone
  static getZoneCharges = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { zone } = req.params;

      if (!zone) {
        return next(new AppError("Zone parameter is required", 400));
      }

      const zoneInfo = await DeliveryZone.findOne({
        zone: zone.toUpperCase(),
        isServiceable: true,
      });

      if (!zoneInfo) {
        return next(new AppError("Zone not found or not serviceable", 404));
      }

      res.status(200).json({
        success: true,
        data: {
          zone: zoneInfo.zone,
          deliveryCharge: zoneInfo.deliveryCharge,
          deliveryDays: zoneInfo.deliveryDays,
          codAvailable: zoneInfo.codAvailable,
          maxWeight: zoneInfo.maxWeight,
          courierPartner: zoneInfo.courierPartner,
        },
      });
    }
  );

  // ✅ Calculate delivery cost for order
  //   static calculateDeliveryCost = catchAsync(
  //     async (req: Request, res: Response, next: NextFunction) => {
  //       const { pincode, weight, orderValue } = req.body;

  //       if (!pincode || !weight) {
  //         return next(new AppError("Pincode and weight are required", 400));
  //       }

  //       const deliveryInfo = await HybridDeliveryService.checkDeliverability(
  //         pincode
  //       );

  //       if (!deliveryInfo.isServiceable) {
  //         return res.status(200).json({
  //           success: true,
  //           data: deliveryInfo,
  //         });
  //       }

  //       // Calculate total delivery cost with weight consideration
  //       let totalCharge = deliveryInfo.deliveryCharge;

  //       // Extra charge for heavy items
  //       if (weight > deliveryInfo.maxWeight) {
  //         const extraWeight = weight - deliveryInfo.maxWeight;
  //         totalCharge += Math.ceil(extraWeight) * 20; // ₹20 per extra kg
  //       }

  //       // Free delivery on high order value
  //       if (orderValue && orderValue >= 1000) {
  //         totalCharge = Math.max(0, totalCharge - 50); // ₹50 discount
  //       }

  //       res.status(200).json({
  //         success: true,
  //         data: {
  //           ...deliveryInfo,
  //           originalCharge: deliveryInfo.deliveryCharge,
  //           finalCharge: totalCharge,
  //           weightSurcharge: totalCharge - deliveryInfo.deliveryCharge,
  //           freeDeliveryEligible: orderValue >= 1000,
  //         },
  //       });
  //     }
  //   );
}
