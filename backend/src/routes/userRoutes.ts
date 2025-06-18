import {
  loginUser,
  logoutUser,
  registerUser,
} from "../controllers/userController";
import { authVerify } from "../middlewares/authVerify";
import upload from "../middlewares/multer";
import { Router } from "express";

const router = Router();

router.post("/register", upload.single("avatar"), registerUser);
router.post("/login", loginUser); // Assuming you have a loginUser function in your controller
router.post("/logout",authVerify, logoutUser); // Assuming you have a loginUser function in your controller

export default router;
