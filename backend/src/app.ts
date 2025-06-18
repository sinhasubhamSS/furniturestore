import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
const app = express();
app.use(cors());
app.use(cookieParser());
app.use(express.json());


import userRoutes from "./routes/userRoutes";   
app.use("/api/user", userRoutes);

export default app;
