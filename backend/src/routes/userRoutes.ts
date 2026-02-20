import {
  sendSignupOtp,
  verifySignupOtp,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getMyProfile,
} from "../controllers/authUserController";

import { authVerify } from "../middlewares/authVerify";
import { Router } from "express";
import { otpRateLimiter, loginRateLimiter } from "../middlewares/rateLimiters";
const router = Router();

/* =========================================================
   🔐 AUTH ROUTES
========================================================= */

router.post("/send-otp", otpRateLimiter, sendSignupOtp);
router.post("/verify-otp", otpRateLimiter, verifySignupOtp);
router.post("/login", loginRateLimiter, loginUser);
router.post("/logout", authVerify, logoutUser);
router.post("/refresh-token", loginRateLimiter, refreshAccessToken);

/* =========================================================
   👤 PROFILE
========================================================= */

router.get("/my-profile", authVerify, getMyProfile);

export default router;
