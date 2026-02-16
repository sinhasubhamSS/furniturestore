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

const router = Router();

/* =========================================================
   🔐 AUTH ROUTES
========================================================= */

// 🔹 Step 1: Send OTP for signup
router.post("/send-otp", sendSignupOtp);

// 🔹 Step 2: Verify OTP & create user
router.post("/verify-otp", verifySignupOtp);

// 🔹 Login
router.post("/login", loginUser);

// 🔹 Logout (Protected)
router.post("/logout", authVerify, logoutUser);

// 🔹 Refresh token
router.post("/refresh-token", refreshAccessToken);

/* =========================================================
   👤 PROFILE
========================================================= */

router.get("/my-profile", authVerify, getMyProfile);

export default router;
