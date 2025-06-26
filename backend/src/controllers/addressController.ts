import { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import { addressService } from "../services/addressService";
import { createAddressSchema } from "../validations/address.validation";
import { ApiResponse } from "../utils/ApiResponse";
import { AuthRequest } from "../types/app-request";

export const getAddresses = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const userId = req.userId!;
    const list = await addressService.getAll(userId);
    res.json(new ApiResponse(200, list, "Addresses fetched"));
  }
);

export const createAddress = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const userId = req.userId!;
    const validated = createAddressSchema.parse(req.body);
    const addr = await addressService.create(userId, validated);
    res.status(201).json(new ApiResponse(201, addr, "Address created"));
  }
);

export const updateAddress = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const userId = req.userId!;
    const addrId = req.params.id;
    const data = createAddressSchema.partial().parse(req.body);
    const addr = await addressService.update(userId, addrId, data);
    res.json(new ApiResponse(200, addr, "Address updated"));
  }
);

export const deleteAddress = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const userId = req.userId!;
    const addrId = req.params.id;
    await addressService.delete(userId, addrId);
    res.json(new ApiResponse(200, null, "Address deleted"));
  }
);
