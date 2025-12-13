import {
  getMyProfile,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
} from "../controllers/authUserController";
import { authVerify } from "../middlewares/authVerify";

import { Router } from "express";

const router = Router();

router.post("/register", registerUser);

router.post("/login", loginUser); // Assuming you have a loginUser function in your controller
router.post("/logout",authVerify, logoutUser); // Assuming you have a loginUser function in your controller
router.post("/refresh-token", refreshAccessToken); // Assuming you have a loginUser function in your controller
router.get("/my-profile",authVerify, getMyProfile); // Assuming you have a loginUser function in your controller

export default router;
