// types/multer.d.ts
import { Request } from "express";
import { File } from "multer";

export interface MulterRequest extends Request {
  file?: MulterFile; // for single upload
  files?: MulterFile[]; // for multiple uploads
  user?: {
    _id: Types.ObjectId; // ✅ This line is essential
    name?: string;
    email?: string;
    role?: string;
  };
}
