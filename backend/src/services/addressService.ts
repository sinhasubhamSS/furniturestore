import Address, { IAddress } from "../models/address.model";
import { Types } from "mongoose";
import { AppError } from "../utils/AppError";
import { CreateAddressInput } from "../validations/address.validation";

class AddressService {
  async getAll(userId: string): Promise<IAddress[]> {
    return await Address.find({ user: userId }).sort({ isDefault: -1, createdAt: -1 });
  }

  async getById(userId: string, addressId: string): Promise<IAddress> {
    const addr = await Address.findOne({ _id: addressId, user: userId });
    if (!addr) throw new AppError("Address not found", 404);
    return addr;
  }

  async create(userId: string, data: CreateAddressInput): Promise<IAddress> {
    if (data.isDefault) {
      // clear previous default
      await Address.updateMany({ user: userId, isDefault: true }, { isDefault: false });
    }
    return await Address.create({ user: userId, ...data });
  }

  async update(userId: string, addressId: string, data: Partial<CreateAddressInput>): Promise<IAddress> {
    const addr = await this.getById(userId, addressId);
    if (data.isDefault) {
      await Address.updateMany({ user: userId, isDefault: true }, { isDefault: false });
    }
    Object.assign(addr, data);
    return await addr.save();
  }

  async delete(userId: string, addressId: string): Promise<void> {
    const res = await Address.deleteOne({ _id: addressId, user: userId });
    if (res.deletedCount === 0) throw new AppError("Address not found", 404);
  }
}

export const addressService = new AddressService();
