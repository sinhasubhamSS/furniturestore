import {registerUser} from "../controllers/userController";
import upload from "../middlewares/multer";
import { Router } from "express";


const router = Router();

router.post("/register", upload.single("avatar"),registerUser);

export default router;