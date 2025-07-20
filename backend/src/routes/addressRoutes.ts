import { Router } from "express";
import {
  createAddress,
  deleteAddress,
  getAddresses,
  updateAddress,
} from "../controllers/addressController";
import { authVerify } from "../middlewares/authVerify";

const router = Router();
router.use(authVerify);
router.get("/", getAddresses);
router.post("/create", createAddress);
router.patch("/update/:id", updateAddress);
router.delete("/delete/:id", deleteAddress);
export default router;
