import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
const app = express();
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true, // 👈 important if using cookies
  }));
app.use(cookieParser());
app.use(express.json());


import userRoutes from "./routes/userRoutes";
import productRoutes from "./routes/productRoutes"   
app.use("/api/user", userRoutes);
app.use("/api/products", productRoutes);

export default app;
