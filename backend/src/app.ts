import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
const app = express();
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true, // 👈 important if using cookies
  })
);
app.use(cookieParser());
app.use(express.json());

import userRoutes from "./routes/userRoutes";
import productRoutes from "./routes/productRoutes";
import cartRoutes from "./routes/cartRoutes";
import wishlistRoute from "./routes/wishlistRoutes";
import addressRoute from "./routes/addressRoutes";
import orderRoute from "./routes/orderRoutes";
import paymentRoute from "./routes/paymentRoutes";
import categoryRoute from "./routes/categoryRoutes";
import { errorMiddleware } from "./middlewares/errorMiddleware";
app.use("/api/user", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoute);
app.use("/api/address", addressRoute);
app.use("/api/order", orderRoute);
app.use("/api/payment", paymentRoute);
app.use("/api/category", categoryRoute);

app.use(errorMiddleware);
export default app;
