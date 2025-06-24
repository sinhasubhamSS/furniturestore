// src/types/app-request.ts
import { Request } from "express";
import { IUser } from "../models/user.models";

export interface AuthRequest extends Request {
  user?: IUser;
  userId?: string;
}
