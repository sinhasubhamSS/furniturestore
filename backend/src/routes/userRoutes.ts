import {
  getMyProfile,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  verifyEmail,
  resendVerificationEmail,
} from "../controllers/authUserController";

import { authVerify } from "../middlewares/authVerify";
import { Router } from "express";

const router = Router();

// 🔐 Auth
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", authVerify, logoutUser);
router.post("/refresh-token", refreshAccessToken);

// 📩 Email Verification
router.get("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerificationEmail);

// 👤 Profile
router.get("/my-profile", authVerify, getMyProfile);

export default router;
